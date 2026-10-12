// Lokal lagring på enheten. Alt er pakket i try/catch: privat modus eller blokkert lagring gir standardverdier.
import { routeOnly } from './share.js';

const KEY = 'reisetavla.v2';
const OLD_SAVED = 'reisetavla.saved';

export const DEFAULTS = {
  maxWalk: 800,
  excluded: [], // [{ id, code, mode, name, desc }]
  alertOn: true,
  openTripKey: null,
  mapTripKey: null,
  saved: [], // [{ name, q }]
  feedbackQueue: [],
};

export function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
  const out = { ...DEFAULTS, ...s };
  if (!s.saved) {
    try { const old = JSON.parse(localStorage.getItem(OLD_SAVED) || '[]'); if (Array.isArray(old)) out.saved = old; } catch (e) { /* ingen gamle */ }
  }
  // Favoritter er strekninger: fjern tid og transportmidler fra eldre lagrede reiser og slå sammen like
  out.saved = (out.saved || []).map((x) => ({ ...x, q: routeOnly(x.q || '') })).filter((x, i, a) => x.q && a.findIndex((y) => y.q === x.q) === i);
  return out;
}

export function save(patch) {
  try {
    const cur = load();
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }));
  } catch (e) { /* lagring utilgjengelig */ }
}
