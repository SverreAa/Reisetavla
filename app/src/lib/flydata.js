// Flydata fra Avinor (gate, innsjekk, status, bagasjebånd), hentet av GitHub Actions hvert ~10. minutt
// til grenen «flydata» (se scripts/flydata.mjs). Brukes til å fylle ut flyetapper fra Entur.
const URL = 'https://raw.githubusercontent.com/SverreAa/Reisetavla/flydata/flydata.json';
const MAX_AGE_MS = 5 * 60000;
let cache = null, cachedAt = 0, pending = null;

export async function loadFlydata() {
  if (cache && Date.now() - cachedAt < MAX_AGE_MS) return cache;
  if (!pending) {
    pending = fetch(URL, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
      .then((d) => { pending = null; if (d && Array.isArray(d.flights)) { cache = d; cachedAt = Date.now(); } return cache; });
  }
  return pending;
}

const hmLocal = (iso) => new Date(iso).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
const airportShort = (name) => String(name || '').replace(/\s+lufthavn.*$/i, '').replace(/,.*$/, '').trim();

// Avinors statuskoder: A landet, C innstilt, D avgått, E ny tid, N ny info
function statusText(f) {
  const [ac, at] = f.arr || [];
  const [dc, dt] = f.dep || [];
  if (ac === 'A') return `Landet ${hmLocal(at)}`;
  if (dc === 'C' || ac === 'C') return 'Innstilt';
  if (dc === 'D') return ac === 'E' && at ? `Avgått · ny ankomst ${hmLocal(at)}` : `Avgått ${hmLocal(dt)}`;
  if (dc === 'E' && dt) {
    const late = f.std ? Math.round((new Date(dt) - new Date(f.std)) / 60000) : 0;
    if (late >= 1) return `Forsinket · ny tid ${hmLocal(dt)}`;
    if (late <= -1) return `Tidligere · ny tid ${hmLocal(dt)}`;
    return 'I rute';
  }
  if (dc === 'N') return 'Ny informasjon';
  return f.delayed ? 'Forsinket' : 'I rute';
}

// Finn Avinor-posten for en flyetappe: samme flightnummer, avgangstid innen ±3 timer.
export function matchFlight(data, leg) {
  if (!data || !leg.code) return null;
  const id = leg.code.replace(/\s+/g, '').toUpperCase();
  const t = new Date(leg.aimedStart || leg.start).getTime();
  let best = null, bd = Infinity;
  for (const f of data.flights) {
    if (f.id !== id || !f.std) continue;
    const d = Math.abs(new Date(f.std).getTime() - t);
    if (d < bd && d < 3 * 3600e3) { bd = d; best = f; }
  }
  return best;
}

// Hvor gamle Avinor-dataene kan være før vi slutter å stole på dem.
// GitHub kjører hentejobben langt sjeldnere enn planlagt, så dataene kan være timer gamle.
export const FRESH_MIN = 30;     // gate, innsjekk og bånd vises bare innenfor denne grensen
export const USABLE_MIN = 180;   // eldre enn dette: Avinor-data brukes ikke i det hele tatt

export function flydataAgeMin(data, now = Date.now()) {
  const t = data && data.updated ? new Date(data.updated).getTime() : NaN;
  return Number.isFinite(t) ? Math.max(0, Math.round((now - t) / 60000)) : Infinity;
}

// Legg Avinor-data inn i flight-objektet på flyetappene (muterer reisene).
// Ferske data (≤ 30 min): status, gate, innsjekk og bånd, med klokkeslett for oppdateringen.
// 30 min–3 t: bare status, tydelig merket med hvor gammel den er. Eldre: Enturs egen status beholdes.
export async function enrichFlights(trips) {
  const air = trips.flatMap((t) => t.legs).filter((l) => l.mode === 'air');
  if (!air.length) return false;
  const data = await loadFlydata();
  if (!data) return false;
  const age = flydataAgeMin(data);
  if (age > USABLE_MIN) return false;
  const fresh = age <= FRESH_MIN;
  const at = hmLocal(data.updated);
  let changed = false;
  air.forEach((leg) => {
    const f = matchFlight(data, leg);
    if (!f) return;
    const { gate, checkIn, belt, beltAirport, ...rest } = leg.flight || {};
    leg.flight = fresh
      ? {
          ...rest,
          status: `${statusText(f)} · Avinor ${at}`,
          gate: f.gate || undefined,
          checkIn: f.checkIn || undefined,
          belt: f.belt || undefined,
          beltAirport: f.belt ? airportShort(leg.to.name) : undefined,
          updated: data.updated,
        }
      : {
          ...rest,
          status: `${statusText(f)} (sist oppdatert ${at} – sjekk skjermene på flyplassen)`,
          updated: data.updated,
        };
    changed = true;
  });
  return changed;
}
