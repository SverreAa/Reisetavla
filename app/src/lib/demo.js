// Eksempeldata (brukes når Entur ikke kan nås, eller med ?demo i adressen).
// Samme reiser som i designoverleveringen, med omtrentlige koordinater i Oslo. Tidene legges relativt til nå.
import { roundM, hm } from './format.js';
import { dist } from './geo.js';

const S = {
  me: ['Pilestredet 35', 59.9205, 10.7357],
  maj: ['Majorstuen', 59.9297, 10.7149], valk: ['Valkyrie plass', 59.9277, 10.7207], hom: ['Homansbyen', 59.9245, 10.7275],
  holb: ['Holbergs plass', 59.9203, 10.7346], tull: ['Tullinløkka', 59.9178, 10.7389], nat: ['Nationaltheatret', 59.9147, 10.7330],
  ovre: ['Øvre Slottsgate', 59.9128, 10.7445], prin: ['Prinsens gate', 59.9112, 10.7478], jbt: ['Jernbanetorget', 59.9118, 10.7500],
  hosp: ['Oslo Hospital', 59.9035, 10.7650], ekeb: ['Ekebergparken', 59.8995, 10.7650], sjom: ['Sjømannsskolen', 59.8946, 10.7684],
  holt: ['Holtet', 59.8825, 10.7795], ljab: ['Ljabru', 59.8700, 10.7840],
  osls: ['Oslo S', 59.9109, 10.7529], lill: ['Lillestrøm', 59.9550, 11.0490], osl: ['Oslo lufthavn', 60.1934, 11.0976],
  stor: ['Stortinget', 59.9131, 10.7418], gron: ['Grønland', 59.9127, 10.7608], natm: ['Nationaltheatret', 59.9146, 10.7318],
  majm: ['Majorstuen', 59.9298, 10.7153], jbtm: ['Jernbanetorget', 59.9117, 10.7499],
  rad: ['Radisson Blu Scandinavia', 59.9194, 10.7363], bgo: ['Bergen lufthavn, Flesland', 60.2934, 5.2181],
};
const pt = (k) => [S[k][1], S[k][2]];
const G = (lat, lon) => ({ guide: [lat, lon] });

export const DEMO_ROUTES = {
  'DEMO:19': { mode: 'tram', code: '19', ends: ['Majorstuen', 'Ljabru'], seq: ['maj', 'valk', 'hom', 'holb', 'tull', 'nat', 'ovre', 'prin', 'jbt', 'hosp', 'ekeb', 'sjom', 'holt', 'ljab'], step: 2 },
  'DEMO:F2': { mode: 'rail', code: 'F2', ends: ['Oslo S', 'Oslo lufthavn'], seq: ['osls', G(59.94, 10.86), 'lill', G(60.07, 11.10), 'osl'], step: 9 },
  'DEMO:R10': { mode: 'rail', code: 'R10', ends: ['Drammen', 'Lillehammer'], seq: ['osls', 'lill', 'osl'], step: 11 },
  'DEMO:2': { mode: 'metro', code: '2', ends: ['Østerås', 'Ellingsrudåsen'], seq: ['majm', 'natm', 'stor', 'jbtm', 'gron'], step: 2 },
  'DEMO:FB2': { mode: 'coach', code: 'FB2', ends: ['Oslo sentrum', 'Oslo lufthavn'], seq: ['rad', G(59.935, 10.79), G(60.02, 10.95), G(60.12, 11.06), 'osl'], step: 12 },
};
const LINE_DESC = { 'DEMO:19': 'Majorstuen – Ljabru', 'DEMO:F2': 'Oslo S – Oslo lufthavn', 'DEMO:R10': 'Drammen – Lillehammer', 'DEMO:2': 'Østerås – Ellingsrudåsen', 'DEMO:FB2': 'Oslo sentrum – Oslo lufthavn' };
const OPERATOR = { 'DEMO:19': 'Ruter', 'DEMO:F2': 'Flytoget', 'DEMO:R10': 'Vy', 'DEMO:2': 'Ruter', 'DEMO:FB2': 'Flybussen' };

export const DEMO_FLIGHTS = {
  SK263: { number: 'SK 263', airline: 'SAS', aircraft: 'Boeing 737-800', status: 'I rute', gate: 'D7', gateOpen: '08:55', bagDrop: '08:50', seats: 14, belt: '3', beltTime: 'ca. 10:40', beltAirport: 'Bergen' },
  DY612: { number: 'DY 612', airline: 'Norwegian', aircraft: 'Boeing 737 MAX 8', status: 'I rute', gate: 'C4', gateOpen: '09:05', bagDrop: '09:00', seats: 6, belt: '5', beltTime: 'ca. 10:50', beltAirport: 'Bergen' },
};

export const DEMO_STOPS = [
  { id: null, name: 'Pilestredet 35', sub: 'Oslo', lat: S.me[1], lon: S.me[2], kind: 'addr' },
  { id: null, name: 'Bergen lufthavn, Flesland', sub: 'Bergen', lat: S.bgo[1], lon: S.bgo[2], kind: 'stop' },
  { id: 'NSR:StopPlace:59872', name: 'Oslo S', sub: 'Oslo', lat: S.osls[1], lon: S.osls[2], kind: 'stop' },
  { id: 'NSR:StopPlace:58366', name: 'Jernbanetorget', sub: 'Oslo', lat: S.jbt[1], lon: S.jbt[2], kind: 'stop' },
  { id: 'NSR:StopPlace:58404', name: 'Nationaltheatret', sub: 'Oslo', lat: S.nat[1], lon: S.nat[2], kind: 'stop' },
  { id: null, name: 'Majorstuen', sub: 'Oslo', lat: S.maj[1], lon: S.maj[2], kind: 'stop' },
  { id: null, name: 'Oslo lufthavn', sub: 'Ullensaker', lat: S.osl[1], lon: S.osl[2], kind: 'stop' },
];

function routeLine(id) {
  return DEMO_ROUTES[id].seq.map((k) => (typeof k === 'string' ? pt(k) : k.guide));
}
function routeStops(id) {
  return DEMO_ROUTES[id].seq.filter((k) => typeof k === 'string').map((k) => ({ name: S[k][0], lat: S[k][1], lon: S[k][2] }));
}

const at = (base, min) => new Date(base.getTime() + min * 60000);

function walk(base, a, b, m, min, s) {
  const start = at(base, s), end = at(base, s + min);
  return { mode: 'foot', code: '', from: place(a), to: place(b), start, end, aimedStart: start, aimedEnd: end, minutes: min, meters: m, polyline: [pt(a), pt(b)], stops: [], crowd: null, control: null, flight: null, realtime: false, situations: [] };
}
function place(k) { return { name: S[k][0], lat: S[k][1], lon: S[k][2], platform: '' }; }

function ride(base, id, fromKey, toKey, s, e, towards, plat, crowd, control) {
  const r = DEMO_ROUTES[id];
  const keys = r.seq.filter((k) => typeof k === 'string');
  const fi = keys.indexOf(fromKey), ti = keys.indexOf(toKey);
  const segKeys = keys.slice(fi, ti + 1);
  const start = at(base, s), end = at(base, e);
  const n = segKeys.length - 1;
  const stops = segKeys.map((k, i) => ({ name: S[k][0], lat: S[k][1], lon: S[k][2], time: at(base, s + ((e - s) * i) / Math.max(1, n)) }));
  // polyline: rutens punkter fra første til siste valgte stopp (inkludert hjelpepunkter)
  const full = r.seq; const a = full.indexOf(fromKey), b = full.indexOf(toKey);
  const polyline = full.slice(a, b + 1).map((k) => (typeof k === 'string' ? pt(k) : k.guide));
  return {
    mode: r.mode, code: r.code, lineId: id, lineName: LINE_DESC[id], operator: OPERATOR[id], colour: null, textColour: null,
    towards, from: { ...place(fromKey), platform: plat }, to: place(toKey), start, end, aimedStart: start, aimedEnd: end,
    minutes: e - s, meters: 0, polyline, stops, crowd, cancelled: false,
    control: control ? { at: control.at, reportedAt: new Date(Date.now() - control.ago * 60000) } : null,
    flight: null, serviceJourneyId: id, realtime: true, situations: [],
  };
}

function fly(base, key, s, e) {
  const f = DEMO_FLIGHTS[key];
  const start = at(base, s), end = at(base, e);
  return {
    mode: 'air', code: f.number, lineId: 'DEMO:' + key, lineName: 'Oslo – Bergen', operator: f.airline, colour: null, textColour: null,
    towards: 'Bergen', from: { ...place('osl'), platform: '' }, to: place('bgo'), start, end, aimedStart: start, aimedEnd: end,
    minutes: e - s, meters: 0, polyline: [pt('osl'), pt('bgo')],
    stops: [{ name: S.osl[0], lat: S.osl[1], lon: S.osl[2], time: start }, { name: S.bgo[0], lat: S.bgo[1], lon: S.bgo[2], time: end }],
    crowd: null, cancelled: false, control: null, flight: { ...f }, serviceJourneyId: null, realtime: true, situations: [],
  };
}

function trip(id, legs) {
  const firstTransit = legs.find((l) => l.mode !== 'foot');
  const start = legs[0].start, end = legs[legs.length - 1].end;
  return { key: 'demo-' + id, legs, start, end, aimedStart: start, firstTransit, minutes: Math.round((end - start) / 60000) };
}

export function demoTrips() {
  const now = new Date(); now.setSeconds(0, 0);
  const b = at(now, -35); // 07:38 i overleveringen = nå + 3 min
  const base = at(b, 0);
  const off = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m - (7 * 60); };
  return [
    trip('t3', [walk(base, 'me', 'rad', 400, 6, off('07:38')), ride(base, 'DEMO:FB2', 'rad', 'osl', off('07:46'), off('08:35'), 'Oslo lufthavn', 'A', 1), fly(base, 'SK263', off('09:30'), off('10:25'))]),
    trip('t1', [walk(base, 'me', 'holb', 350, 5, off('07:41')), ride(base, 'DEMO:19', 'holb', 'jbt', off('07:46'), off('07:55'), 'Ljabru', 'B', 3, { at: 'Tullinløkka', ago: 12 }),
      walk(base, 'jbt', 'osls', 250, 4, off('07:55')), ride(base, 'DEMO:F2', 'osls', 'osl', off('08:10'), off('08:29'), 'Oslo lufthavn', '13', 1), fly(base, 'SK263', off('09:30'), off('10:25'))]),
    trip('t2', [walk(base, 'me', 'natm', 550, 7, off('07:44')), ride(base, 'DEMO:2', 'natm', 'jbtm', off('07:52'), off('07:55'), 'Ellingsrudåsen', '1', 2),
      walk(base, 'jbtm', 'osls', 150, 3, off('07:55')), ride(base, 'DEMO:R10', 'osls', 'osl', off('08:09'), off('08:32'), 'Lillehammer', '4', 2), fly(base, 'DY612', off('09:40'), off('10:35'))]),
  ].sort((x, y) => x.start - y.start);
}

export const DEMO_SEARCH = { from: DEMO_STOPS[0], to: DEMO_STOPS[1] };

// Valgt rute i demo: hele traseen, med simulerte kjøretøy som går fram og tilbake.
export function demoRoute(leg) {
  const r = DEMO_ROUTES[leg.lineId];
  const stops = routeStops(leg.lineId).map((s, i) => ({ ...s, min: i * r.step }));
  let myIndex = 0, bd = Infinity;
  stops.forEach((s, i) => { const d = dist([s.lat, s.lon], [leg.from.lat, leg.from.lon]); if (d < bd) { bd = d; myIndex = i; } });
  return { lineId: leg.lineId, mode: r.mode, code: r.code, colour: null, polyline: routeLine(leg.lineId), stops, myIndex, ends: r.ends, towards: leg.towards, demo: true };
}

const SIM = {};
export function demoVehicles(route) {
  const n = route.stops.length - 1;
  if (!SIM[route.lineId]) {
    const seeds = { 'DEMO:19': [[0.5, 1], [2.2, 1], [6.4, 1], [10.8, 1], [1.6, -1], [5.2, -1], [8.7, -1], [12.2, -1]], 'DEMO:F2': [[0.4, 1], [2.3, -1], [1.2, -1]], 'DEMO:R10': [[0.6, 1], [1.4, -1]], 'DEMO:2': [[0.7, 1], [3.5, 1], [1.2, -1], [3.6, -1]], 'DEMO:FB2': [[0.5, 1], [0.9, -1]] };
    SIM[route.lineId] = (seeds[route.lineId] || [[0, 1]]).map(([p, d], i) => ({ id: route.code + '-' + i, p: Math.min(p, n), d }));
  }
  SIM[route.lineId].forEach((v) => { v.p += v.d * 0.05; if (v.p > n) { v.p = n; v.d = -1; } if (v.p < 0) { v.p = 0; v.d = 1; } });
  return SIM[route.lineId].map((v) => {
    const i = Math.min(Math.floor(v.p), n - 1), f = v.p - i, A = route.stops[i], B = route.stops[i + 1];
    return { id: v.id, lat: A.lat + (B.lat - A.lat) * f, lon: A.lon + (B.lon - A.lon) * f, dir: v.d, p: v.p };
  });
}

export const demoMeters = (legs) => legs.map((l) => roundM(l.meters));
