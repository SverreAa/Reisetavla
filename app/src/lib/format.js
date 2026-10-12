// Tider, varigheter og avstander slik designsystemet skriver dem.
export const MODE_NAME = { bus: 'Buss', coach: 'Buss', rail: 'Tog', metro: 'T-bane', tram: 'Trikk', water: 'Båt', air: 'Fly', foot: 'Gange' };
export const MODE_ALL = { bus: 'Alle busser på linjen', coach: 'Alle busser på linjen', rail: 'Alle tog på linjen', metro: 'Alle T-baner på linjen', tram: 'Alle trikker på linjen', water: 'Alle båter på linjen' };
export const MODES = [['bus', 'Buss'], ['rail', 'Tog'], ['metro', 'T-bane'], ['tram', 'Trikk'], ['water', 'Båt'], ['coach', 'Ekspressbuss'], ['air', 'Fly']];
export const WALKS = [{ id: '200', label: '200 m' }, { id: '400', label: '400 m' }, { id: '800', label: '800 m' }, { id: '1500', label: '1,5 km' }];

const pad = (n) => String(n).padStart(2, '0');
export const hm = (d) => { const x = new Date(d); return `${pad(x.getHours())}:${pad(x.getMinutes())}`; };
export const minutesBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 60000);
export const minsFromNow = (d) => Math.round((new Date(d) - Date.now()) / 60000);

export function durText(min) {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return `${h} t${r ? ` ${r} min` : ''}`;
}

export function soonText(d) {
  const m = minsFromNow(d);
  if (m <= 0) return 'Går nå';
  if (m < 60) return `om ${m} min`;
  return '';
}

export const transfersText = (n) => (n <= 0 ? 'Direkte' : n === 1 ? '1 bytte' : `${n} bytter`);
export const fmtM = (m) => (m >= 1000 ? `${String(Math.round(m / 100) / 10).replace('.', ',')} km` : `${Math.round(m / 10) * 10} m`);
export const roundM = (m) => Math.round((m || 0) / 10) * 10;
export const platformLabel = (mode, code) => (code ? `${mode === 'rail' ? 'Spor' : 'Plattform'} ${code}` : '');
export const lineName = (mode, code) => `${MODE_NAME[mode] || ''} ${code || ''}`.trim();
export const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
