// Entur: reiseplanlegger (JP v3), geokoder og kjøretøyposisjoner. Alt normaliseres til appens reisemodell.
import { decodePolyline, dist } from './geo.js';
import { hm, roundM, minutesBetween } from './format.js';

export const CLIENT = 'sverre-reisetavla';
const JP = 'https://api.entur.io/journey-planner/v3/graphql';
const GEO = 'https://api.entur.io/geocoder/v1/autocomplete';
const VEH = 'https://api.entur.io/realtime/v2/vehicles/graphql';

async function gql(url, query, variables) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ET-Client-Name': CLIENT }, body: JSON.stringify({ query, variables }) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.errors && !j.data) throw new Error(j.errors[0].message);
  if (j.errors) { const e = new Error(j.errors[0].message); e.partial = j.data; throw e; }
  return j.data;
}

export async function detect() {
  try {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), 4000);
    const r = await fetch(`${GEO}?text=oslo&size=1`, { headers: { 'ET-Client-Name': CLIENT }, signal: c.signal });
    clearTimeout(t); return r.ok;
  } catch (e) { return false; }
}

export async function geocode(q) {
  const r = await fetch(`${GEO}?text=${encodeURIComponent(q)}&size=7&lang=no`, { headers: { 'ET-Client-Name': CLIENT } });
  const j = await r.json();
  return (j.features || []).map((f) => ({
    id: f.properties.id, name: f.properties.name,
    sub: [f.properties.locality, f.properties.county].filter(Boolean).join(', '),
    lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0],
    kind: String(f.properties.id).startsWith('NSR:') ? 'stop' : 'addr',
  }));
}

const CALL_FIELDS = 'cancellation destinationDisplay{ frontText }';
const tripQuery = (withOcc) => `query($from:Location!,$to:Location!,$dateTime:DateTime,$arriveBy:Boolean,$modes:Modes,$banned:InputBanned){
 trip(from:$from,to:$to,dateTime:$dateTime,arriveBy:$arriveBy,modes:$modes,banned:$banned,numTripPatterns:8){
  tripPatterns{ aimedStartTime expectedStartTime aimedEndTime expectedEndTime duration
   legs{ mode transportSubmode serviceDate distance duration realtime aimedStartTime expectedStartTime aimedEndTime expectedEndTime
    line{ id publicCode name transportMode authority{ name } presentation{ colour textColour } }
    fromPlace{ name latitude longitude quay{ id publicCode } }
    toPlace{ name latitude longitude quay{ id publicCode } }
    fromEstimatedCall{ ${CALL_FIELDS}${withOcc ? ' occupancyStatus' : ''} }
    intermediateEstimatedCalls{ quay{ name latitude longitude } aimedArrivalTime expectedArrivalTime expectedDepartureTime }
    pointsOnLink{ points }
    serviceJourney{ id }
    situations{ severity summary{ value language } }
   } } } }`;

const loc = (p) => (p.id && String(p.id).startsWith('NSR:') ? { place: p.id, name: p.name } : { name: p.name, coordinates: { latitude: p.lat, longitude: p.lon } });

let occOk = true;
export async function fetchTrips({ from, to, when, date, time, modes, allModes, bannedLines }) {
  // Entur gir bare de «beste» forslagene. For å få både tog og buss med søker vi også
  // i hver hovedgruppe for seg og slår sammen resultatene (som i første live-versjon).
  const base = {
    from: loc(from), to: loc(to),
    dateTime: (when === 'now' ? new Date() : new Date(`${date}T${time}`)).toISOString(),
    arriveBy: when === 'arrive',
    banned: bannedLines && bannedLines.length ? { lines: bannedLines } : null,
  };
  const mk = (list) => ({ accessMode: 'foot', egressMode: 'foot', directMode: 'foot', transportModes: list.map((m) => ({ transportMode: m })) });
  const sel = modes.slice(), groups = [sel];
  const rail = sel.filter((m) => m === 'rail'), road = sel.filter((m) => m === 'bus' || m === 'coach');
  if (rail.length && sel.length > 1) groups.push(rail);
  if (road.length && road.length < sel.length) groups.push(road);
  const one = async (g) => {
    const vars = { ...base, modes: mk(g) };
    try { return await gql(JP, tripQuery(occOk), vars); }
    catch (e) { if (occOk && /occupancy/i.test(e.message)) { occOk = false; return gql(JP, tripQuery(false), vars); } throw e; }
  };
  const res = await Promise.allSettled(groups.map(one));
  if (res[0].status === 'rejected') throw res[0].reason;
  const seen = new Set(), out = [];
  for (const r of res) {
    if (r.status !== 'fulfilled') continue;
    for (const p of r.value.trip.tripPatterns || []) {
      const k = p.expectedStartTime + '|' + p.legs.filter((l) => l.mode !== 'foot').map((l) => l.mode + (l.line?.publicCode || '')).join('>');
      if (!seen.has(k)) { seen.add(k); out.push(p); }
    }
  }
  if (!out.length) return [];
  const fastest = Math.min(...out.map((p) => p.duration));
  return out.filter((p) => p.duration <= fastest * 2.2 + 600)
    .sort((a, b) => new Date(a.expectedStartTime) - new Date(b.expectedStartTime)).slice(0, 10)
    .map(normalizeTrip);
}

const OCC = { empty: 1, manySeatsAvailable: 1, manyEmptySeats: 1, fewSeatsAvailable: 2, standingRoomOnly: 3, crushedStandingRoomOnly: 3, full: 3, notAcceptingPassengers: 3 };
const flightCode = (c) => (c ? String(c).replace(/^([A-Z0-9]{2})\s*(\d+)$/, '$1 $2') : c);

function normalizeLeg(l) {
  const mode = l.mode === 'foot' || l.mode === 'bicycle' ? 'foot' : (l.line?.transportMode || l.mode);
  const fromPt = [l.fromPlace.latitude, l.fromPlace.longitude];
  const toPt = [l.toPlace.latitude, l.toPlace.longitude];
  const start = new Date(l.expectedStartTime), end = new Date(l.expectedEndTime);
  const stops = mode === 'foot' ? [] : [
    { name: l.fromPlace.name, lat: fromPt[0], lon: fromPt[1], time: start },
    ...(l.intermediateEstimatedCalls || []).map((c) => ({ name: c.quay?.name, lat: c.quay?.latitude, lon: c.quay?.longitude, time: new Date(c.expectedArrivalTime || c.aimedArrivalTime) })),
    { name: l.toPlace.name, lat: toPt[0], lon: toPt[1], time: end },
  ];
  let poly = decodePolyline(l.pointsOnLink?.points);
  if (poly.length < 2) poly = [fromPt, toPt];
  const code = mode === 'air' ? flightCode(l.line?.publicCode) : (l.line?.publicCode || '');
  const leg = {
    mode, code,
    lineId: l.line?.id || null, lineName: l.line?.name || '', operator: l.line?.authority?.name || '',
    colour: l.line?.presentation?.colour ? '#' + l.line.presentation.colour : null,
    textColour: l.line?.presentation?.textColour ? '#' + l.line.presentation.textColour : null,
    towards: l.fromEstimatedCall?.destinationDisplay?.frontText || l.toPlace.name,
    from: { name: l.fromPlace.name, lat: fromPt[0], lon: fromPt[1], platform: l.fromPlace.quay?.publicCode || '' },
    to: { name: l.toPlace.name, lat: toPt[0], lon: toPt[1], platform: l.toPlace.quay?.publicCode || '' },
    start, end, aimedStart: new Date(l.aimedStartTime), aimedEnd: new Date(l.aimedEndTime),
    minutes: Math.max(1, Math.round(l.duration / 60)), meters: roundM(l.distance),
    polyline: poly, stops,
    crowd: OCC[l.fromEstimatedCall?.occupancyStatus] || null,
    cancelled: !!l.fromEstimatedCall?.cancellation,
    control: null,
    flight: null,
    serviceJourneyId: l.serviceJourney?.id || null,
    serviceDate: l.serviceDate || null,
    sub: l.transportSubmode || null,
    realtime: !!l.realtime,
    situations: (l.situations || []).map((s) => ({ text: (s.summary || []).find((x) => /^n(o|ob)$/.test(x.language || ''))?.value || s.summary?.[0]?.value, severity: s.severity })).filter((s) => s.text),
  };
  if (mode === 'air') {
    const delay = minutesBetween(l.aimedStartTime, l.expectedStartTime);
    leg.flight = { number: code, airline: leg.operator, status: l.realtime ? (delay >= 5 ? `Forsinket ${delay} min` : 'I rute') : undefined };
  }
  return leg;
}

export function normalizeTrip(p) {
  const legs = p.legs.map(normalizeLeg);
  const firstTransit = legs.find((l) => l.mode !== 'foot');
  const key = legs.map((l) => (l.mode === 'foot' ? 'f' : `${l.mode}:${l.code}`)).join('|') + '@' + hm(firstTransit ? firstTransit.aimedStart : p.aimedStartTime);
  return {
    key, legs,
    start: new Date(p.expectedStartTime), end: new Date(p.expectedEndTime),
    aimedStart: new Date(p.aimedStartTime),
    firstTransit,
    minutes: Math.round(p.duration / 60),
  };
}

// --- Avganger fra stopp ---
const BOARD_Q = `query($id:String!,$start:DateTime,$modes:[TransportMode]){
 stopPlace(id:$id){ name estimatedCalls(startTime:$start,numberOfDepartures:24,timeRange:86400,whiteListedModes:$modes){
  realtime cancellation aimedDepartureTime expectedDepartureTime quay{ publicCode }
  destinationDisplay{ frontText }
  serviceJourney{ journeyPattern{ line{ publicCode transportMode authority{ name } presentation{ colour textColour } } } } } } }`;
const NEAR_Q = `query($lat:Float!,$lon:Float!){ nearest(latitude:$lat,longitude:$lon,maximumDistance:1500,filterByPlaceTypes:[stopPlace],first:3){
  edges{ node{ distance place{ ... on StopPlace{ id name latitude longitude } } } } } }`;

export async function resolveStop(p) {
  if (p.id && String(p.id).startsWith('NSR:StopPlace')) return p;
  const d = await gql(JP, NEAR_Q, { lat: p.lat, lon: p.lon });
  const n = d.nearest?.edges?.find((e) => e.node.place?.id)?.node;
  if (!n) throw new Error('Fant ingen stopp i nærheten');
  return { id: n.place.id, name: n.place.name, lat: n.place.latitude, lon: n.place.longitude, dist: Math.round(n.distance) };
}

export async function fetchBoard(stop, { when, date, time, modes, allModes }) {
  const d = await gql(JP, BOARD_Q, { id: stop.id, start: when === 'now' ? null : new Date(`${date}T${time}`).toISOString(), modes: allModes ? null : modes });
  return d.stopPlace?.estimatedCalls || [];
}

// --- Valgt rute i kart: hele traseen og kjøretøy ---
const SJ_Q = `query($id:String!){ serviceJourney(id:$id){ pointsOnLink{ points } passingTimes{ quay{ name latitude longitude } departure{ time } arrival{ time } } } }`;

export async function fetchRoute(leg) {
  const d = await gql(JP, SJ_Q, { id: leg.serviceJourneyId });
  const sj = d.serviceJourney;
  const toMin = (s) => { if (!s) return null; const [a, b] = s.split(':').map(Number); return a * 60 + b; };
  const stops = (sj?.passingTimes || []).map((pt) => ({ name: pt.quay?.name, lat: pt.quay?.latitude, lon: pt.quay?.longitude, min: toMin(pt.departure?.time || pt.arrival?.time) })).filter((s) => s.lat != null);
  let poly = decodePolyline(sj?.pointsOnLink?.points);
  if (poly.length < 2) poly = stops.map((s) => [s.lat, s.lon]);
  const myIndex = nearestStopIndex(stops, [leg.from.lat, leg.from.lon], leg.from.name);
  return { lineId: leg.lineId, mode: leg.mode, code: leg.code, colour: leg.colour, polyline: poly, stops, myIndex, ends: [stops[0]?.name, stops[stops.length - 1]?.name], towards: leg.towards };
}

export function nearestStopIndex(stops, pt, name) {
  let bi = 0, bd = Infinity;
  stops.forEach((s, i) => { const d = dist([s.lat, s.lon], pt) - (name && s.name === name ? 200 : 0); if (d < bd) { bd = d; bi = i; } });
  return bi;
}

let vehDest = true;
export async function fetchVehicles(lineId) {
  const q = (withDest) => `query($line:String){ vehicles(lineRef:$line){ vehicleId lastUpdated ${withDest ? 'destinationName ' : ''}location{ latitude longitude } } }`;
  let d;
  try { d = await gql(VEH, q(vehDest), { line: lineId }); }
  catch (e) {
    if (vehDest && /destinationName/i.test(e.message)) { vehDest = false; d = await gql(VEH, q(false), { line: lineId }); }
    else throw e;
  }
  return (d.vehicles || []).filter((v) => v.location).map((v) => ({ id: v.vehicleId, lat: v.location.latitude, lon: v.location.longitude, dest: v.destinationName || null, updated: v.lastUpdated }));
}
