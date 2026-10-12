// Delbar lenke med hele søkeoppsettet (samme parametre som den første versjonen av appen).
import { MODES } from './format.js';

const ALL = MODES.map((m) => m[0]);
const encPlace = (p) => (p.id && String(p.id).startsWith('NSR:') ? p.id : `${p.lat.toFixed(5)},${p.lon.toFixed(5)}`);

function decPlace(v, name) {
  if (!v) return null;
  if (v.startsWith('NSR:')) return { id: v, name: name || v, kind: 'stop' };
  const [a, b] = v.split(',').map(Number);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return { id: null, name: name || 'Valgt sted', lat: a, lon: b, kind: 'addr' };
}

export function toParams(s, allModes) {
  const p = new URLSearchParams();
  if (s.from && s.from.kind !== 'me') { p.set('fra', encPlace(s.from)); p.set('fn', s.from.name); }
  if (s.to && s.to.kind !== 'me') { p.set('til', encPlace(s.to)); p.set('tn', s.to.name); }
  if (s.when !== 'now') { p.set('k', s.when === 'arrive' ? 'ankomst' : 'avreise'); p.set('t', s.time); p.set('d', s.date); }
  if (!allModes) p.set('m', s.modes.join(','));
  return p.toString();
}

export function fromParams(qs) {
  const p = new URLSearchParams(qs);
  const out = {};
  if (p.get('fra')) out.from = decPlace(p.get('fra'), p.get('fn'));
  if (p.get('til')) out.to = decPlace(p.get('til'), p.get('tn'));
  const k = p.get('k');
  if (k) out.when = k === 'ankomst' ? 'arrive' : 'depart';
  if (p.get('t')) out.time = p.get('t');
  if (p.get('d')) out.date = p.get('d');
  if (p.get('m')) { const m = p.get('m').split(',').filter((x) => ALL.includes(x)); if (m.length) out.modes = m; }
  return out;
}

export function shareUrl(s, allModes) {
  const base = location.protocol.startsWith('http') ? location.origin + location.pathname : 'https://din-side.no/reisetavla/';
  const q = toParams(s, allModes);
  return q ? `${base}?${q}` : base;
}
