// Hvor på reisen er brukeren? Steg langs reisen, avstigningsvarsel, statuslinje og kjøretøy på valgt rute.
import { hm, lower, MODE_NAME } from './format.js';
import { dist, project, lerp } from './geo.js';

// Navngitte punkter per etappe: gange = fra/til, kjøretøy = alle stopp. Fly tas ikke med.
export function legPoints(l) {
  if (l.mode === 'foot') return [{ name: l.from.name, lat: l.from.lat, lon: l.from.lon, time: l.start }, { name: l.to.name, lat: l.to.lat, lon: l.to.lon, time: l.end }];
  return l.stops;
}

export function steps(trip) {
  const out = [];
  trip.legs.forEach((l, li) => {
    if (l.mode === 'air') return;
    legPoints(l).forEach((p, i) => { if (li > 0 && i === 0) return; out.push({ li, i, ...p }); });
  });
  return out;
}

export function stepByTime(st, now = Date.now()) {
  let idx = 0;
  st.forEach((s, i) => { if (new Date(s.time).getTime() <= now) idx = i; });
  return idx;
}

// Samlet tilstand for kartet: nåværende/neste steg, posisjon, varsel og statuslinje.
export function journeyState(trip, { stepIndex, alertOn, gps, demo, now = Date.now() }) {
  const st = steps(trip);
  if (!st.length) return null;
  const si = Math.max(0, Math.min(stepIndex ?? stepByTime(st, now), st.length - 1));
  const s = st[si], ns = st[si + 1];
  const curLeg = trip.legs[s.li], curPts = legPoints(curLeg), last = curPts.length - 1;

  let me = [s.lat, s.lon];
  if (!demo && ns) {
    const t0 = new Date(s.time).getTime(), t1 = new Date(ns.time).getTime();
    if (t1 > t0 && now > t0) me = lerp([s.lat, s.lon], [ns.lat, ns.lon], Math.min(1, (now - t0) / (t1 - t0)));
  }
  if (gps) {
    const near = trip.legs.some((l) => l.mode !== 'air' && project(l.polyline, gps).d < 2000);
    if (near) me = gps;
  }

  let alertTitle = '', alertText = '';
  if (alertOn) {
    const arrivedRecently = demo || now - new Date(s.time).getTime() < 3 * 60000;
    if (curLeg.mode !== 'foot' && s.i === last && arrivedRecently) {
      alertTitle = 'Gå av nå'; alertText = `${s.name} · ${MODE_NAME[curLeg.mode]} ${curLeg.code}`;
    } else if (ns) {
      const nl = trip.legs[ns.li], np = legPoints(nl);
      if (nl.mode !== 'foot' && ns.i === np.length - 1) { alertTitle = 'Gå av ved neste stopp'; alertText = `${ns.name} · ankomst ${hm(nl.end)}`; }
    }
  }

  const onBoard = curLeg.mode !== 'foot' && s.i < last;
  let status = onBoard ? `Om bord på ${lower(MODE_NAME[curLeg.mode])} ${curLeg.code} · ved ${s.name}` : `Du er ved ${s.name}`;
  if (ns) status += ` · neste: ${ns.name}`;
  else {
    const air = trip.legs.find((l) => l.flight && l.flight.gate);
    if (air) status += ` · gate ${air.flight.gate}${air.flight.gateOpen ? ` åpner ${air.flight.gateOpen}` : ''}`;
  }

  const legDone = (li) => li < s.li || (li === s.li && s.i === legPoints(trip.legs[li]).length - 1 && trip.legs[li].mode !== 'air');
  const passed = (li, k) => li < s.li || (li === s.li && k <= s.i);
  return { steps: st, si, s, ns, me, alertTitle, alertText, status, legDone, passed, isLast: si === st.length - 1 };
}

// --- Kjøretøy på valgt rute ---
const norm = (x) => String(x || '').toLowerCase().replace(/[^a-zæøå0-9]/g, '');

function positionOnRoute(route, p) {
  const line = route.stops.map((s) => [s.lat, s.lon]);
  if (line.length < 2) return 0;
  const pr = project(line, p);
  return pr.index + pr.t;
}

export function classifyVehicles(route, vehicles, prev = {}) {
  const my = route.myIndex, myName = route.stops[my]?.name || '';
  const lastName = route.stops[route.stops.length - 1]?.name;
  const list = vehicles.map((v) => {
    const p = v.p ?? positionOnRoute(route, [v.lat, v.lon]);
    let d = v.dir || 0;
    if (!d && v.dest) d = (norm(v.dest) === norm(route.towards) || norm(v.dest) === norm(lastName) || norm(route.towards).includes(norm(v.dest))) ? 1 : -1;
    if (!d && prev[v.id]) { const dp = p - prev[v.id].p; d = Math.abs(dp) > 0.02 ? Math.sign(dp) : prev[v.id].d || 0; }
    const toward = (d > 0 && p < my) || (d < 0 && p > my);
    const ni = Math.max(0, Math.min(route.stops.length - 1, Math.round(p)));
    const a = route.stops[my]?.min, b = route.stops[ni]?.min;
    const min = Math.max(1, a != null && b != null ? Math.abs(a - b) : Math.round(Math.abs(my - p) * 2));
    return {
      id: v.id, lat: v.lat, lon: v.lon, p, d, toward, dist: Math.abs(my - p),
      where: `Ved ${route.stops[ni]?.name || 'ukjent sted'}`,
      status: toward ? `om ${min} min til ${myName}` : (d === 0 ? 'retning ikke kjent ennå' : `har passert ${myName}`),
    };
  });
  const groups = [1, -1].map((d) => ({
    title: 'Mot ' + (d > 0 ? route.ends[1] : route.ends[0]),
    note: d > 0 ? 'Din retning' : 'Motsatt spor',
    rows: list.filter((v) => v.d === d).sort((a, b) => (b.toward - a.toward) || (a.dist - b.dist)),
  })).filter((g) => g.rows.length);
  const memo = Object.fromEntries(list.map((v) => [v.id, { p: v.p, d: v.d }]));
  return { list, groups, memo };
}

export const near = (a, b) => dist(a, b);
