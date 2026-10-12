// Delbar lenke med hele søkeoppsettet (samme parametre som den første versjonen av appen),
// og delbar lenke til én reise i Reisekartet (kart.html?r=…).
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

// Favoritter er strekninger (fra/til). Tid og transportmidler velges fritt hver gang.
export function routeOnly(q) {
  const p = new URLSearchParams(q), o = new URLSearchParams();
  ['fra', 'fn', 'til', 'tn'].forEach((k) => { if (p.get(k)) o.set(k, p.get(k)); });
  return o.toString();
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
  const base = location.protocol.startsWith('http') ? location.origin + location.pathname : 'https://sverreaa.github.io/Reisetavla/';
  const q = toParams(s, allModes);
  return q ? `${base}?${q}` : base;
}

// Samme format som Reisekartet (kart.html) leser: kort lenke uten linjeføring – mottakeren henter den selv fra Entur.
export function tripLink(trip, search) {
  const r = (n) => Math.round(n * 1e5) / 1e5;
  const legs = trip.legs.filter((l) => l.from.lat != null && l.to.lat != null);
  const c = {
    f: search.from?.name || legs[0].from.name, t: search.to?.name || legs[legs.length - 1].to.name,
    s: new Date(trip.start).toISOString(), e: new Date(trip.end).toISOString(),
    l: legs.map((l) => [l.mode, l.code || '', l.serviceJourneyId || '', l.serviceDate || '', l.from.name, r(l.from.lat), r(l.from.lon), l.to.name, r(l.to.lat), r(l.to.lon),
      new Date(l.start).toISOString(), new Date(l.end).toISOString(), Math.round((l.end - l.start) / 1000), l.sub === 'railReplacementBus' ? 1 : 0]),
  };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(c)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const dir = location.protocol.startsWith('http') ? location.origin + location.pathname.replace(/[^/]*$/, '') : 'https://sverreaa.github.io/Reisetavla/';
  return `${dir}kart.html?r=${b64}`;
}
