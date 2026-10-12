// Fra reisemodell til det skjermene viser: filtrering (maks gange, ekskluderte ruter) og TripCard-props.
import { hm, durText, soonText, platformLabel, fmtM, lower, MODE_NAME, WALKS, lineName } from './format.js';

export const CONTROL_MAX_AGE = 30; // minutter

const footLegs = (t) => t.legs.filter((l) => l.mode === 'foot');
export const walkMax = (t) => Math.max(0, ...footLegs(t).map((l) => l.meters || 0));
export function longestWalk(t) {
  const legs = footLegs(t).slice().sort((a, b) => (b.meters || 0) - (a.meters || 0));
  const l = legs[0];
  if (!l) return null;
  const isEgress = t.legs.indexOf(l) === t.legs.length - 1 && t.legs.length > 1;
  return { leg: l, meters: l.meters, stop: isEgress ? l.from.name : l.to.name };
}

export function filterTrips(trips, { excluded, maxWalk }) {
  const ex = new Set(excluded.map((e) => e.id));
  const cand = trips.filter((t) => !t.legs.some((l) => l.lineId && ex.has(l.lineId)));
  const within = cand.filter((t) => walkMax(t) <= maxWalk);
  const hidden = trips.length - cand.length;
  if (within.length || !cand.length) return { list: within, outside: false, hidden, cand };
  const best = cand.slice().sort((a, b) => walkMax(a) - walkMax(b))[0];
  return { list: [best], outside: true, best, hidden, cand };
}

export function outsideInfo(best, maxWalk) {
  const wl = longestWalk(best);
  if (!wl) return null;
  const need = walkMax(best);
  const opt = WALKS.find((w) => Number(w.id) >= need);
  return {
    text: `Ingen stopp innenfor ${fmtM(maxWalk)} gange. Nærmeste alternativ er ${wl.stop}, ${wl.meters} m unna. Vi viser det beste forslaget utenfor maks gange.`,
    raiseTo: opt ? Number(opt.id) : null,
    raiseLabel: opt ? `Øk til ${opt.label}` : '',
  };
}

const controlAge = (c) => Math.max(0, Math.round((Date.now() - new Date(c.reportedAt).getTime()) / 60000));
const freshControl = (l) => l.control && controlAge(l.control) <= CONTROL_MAX_AGE;

export function tripCardProps(t, { outside, maxWalk }) {
  const transit = t.legs.filter((l) => l.mode !== 'foot');
  const first = transit[0];
  const delayMs = first ? first.start - first.aimedStart : 0;
  const late = delayMs >= 60000;
  const notices = [];
  const rrb = t.legs.filter((l) => l.sub === 'railReplacementBus');
  if (rrb.length) notices.push(`Buss for tog: ${rrb.map((l) => `${l.from.name} – ${l.to.name}`).join(', ')}`);
  const cl = t.legs.find(freshControl);
  if (cl) notices.push(`Billettkontroll meldt ved ${cl.control.at} på ${lower(MODE_NAME[cl.mode])} ${cl.code} for ${controlAge(cl.control)} min siden`);
  if (outside) {
    const wl = longestWalk(t);
    if (wl) notices.push(`${wl.meters} m gange til ${wl.stop} er over maks gange (${fmtM(maxWalk)}).`);
  }
  const sevRank = (s) => ({ verySevere: 4, severe: 3, normal: 2, slight: 1, noImpact: 0 }[s] ?? 2);
  t.legs.flatMap((l) => l.situations || []).sort((a, b) => sevRank(b.severity) - sevRank(a.severity))
    .forEach((s) => { if (!notices.includes(s.text)) notices.push(s.text); });
  return {
    dep: hm(t.start), arr: hm(t.end), wasDep: late ? hm(new Date(t.start.getTime() - delayMs)) : undefined,
    duration: durText(t.minutes), soon: soonText(t.start), realtime: transit.some((l) => l.realtime),
    platform: first ? (first.mode === 'air' ? '' : platformLabel(first.mode, first.from.platform)) : '',
    cancelled: transit.some((l) => l.cancelled),
    notices,
    legs: t.legs.map((l) => ({
      mode: l.mode, code: l.code, colour: l.colour || undefined, textColour: l.textColour || undefined,
      duration: Math.max(2, l.minutes), minutes: l.minutes, meters: l.mode === 'foot' ? l.meters : undefined,
      start: hm(l.start), end: hm(l.end), late: undefined,
      towards: l.towards, from: l.from.name, to: l.mode === 'air' ? l.to.name : l.to.name,
      platform: l.mode === 'air' ? undefined : (l.from.platform ? platformLabel(l.mode, l.from.platform) : undefined),
      stops: l.mode === 'foot' || l.mode === 'air' ? undefined : Math.max(0, l.stops.length - 2),
      crowd: l.crowd || undefined,
      control: freshControl(l) ? `Billettkontroll meldt ved ${l.control.at} for ${controlAge(l.control)} min siden` : undefined,
      flight: l.flight || undefined,
    })),
  };
}

export function exclusionRows(trips, excluded) {
  const map = new Map();
  excluded.forEach((e) => map.set(e.id, e));
  trips.forEach((t) => t.legs.forEach((l) => {
    if (!l.lineId || l.mode === 'foot' || l.mode === 'air' || map.has(l.lineId)) return;
    map.set(l.lineId, { id: l.lineId, code: l.code, mode: l.mode, name: lineName(l.mode, l.code), desc: l.lineName || `mot ${l.towards}` });
  }));
  return [...map.values()];
}
