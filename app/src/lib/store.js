// Lokal lagring på enheten. Alt er pakket i try/catch: privat modus eller blokkert lagring gir standardverdier.
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
  return out;
}

export function save(patch) {
  try {
    const cur = load();
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }));
  } catch (e) { /* lagring utilgjengelig */ }
}
