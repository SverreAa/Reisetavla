// Flydata fra Avinor (gate, innsjekk, status, bagasjebånd).
// Hovedkilde: Cloudflare Worker-en (worker/), som henter for akkurat de flyplassene reisen går via
// og mellomlagrer i 3 minutter. Reserve: flydata.json i grenen «flydata», som GitHub Actions
// oppdaterer (sjelden – GitHub nedprioriterer planlagte jobber).
import { FLYDATA_WORKER } from './config.js';
import { airportCode } from './airports.js';

const RAW_URL = 'https://raw.githubusercontent.com/SverreAa/Reisetavla/flydata/flydata.json';
const CACHE_MS = 50 * 1000;
const cache = new Map(); // nøkkel → { at, data, pending }

export const flightId = (code) => String(code || '').replace(/\s+/g, '').toUpperCase();

async function getJson(url) {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    const d = await r.json();
    return d && Array.isArray(d.flights) ? d : null;
  } catch (e) { return null; }
}

function cached(key, load) {
  const c = cache.get(key);
  if (c && c.data && Date.now() - c.at < CACHE_MS) return Promise.resolve(c.data);
  if (c && c.pending) return c.pending;
  const pending = load().then((data) => {
    if (data) cache.set(key, { at: Date.now(), data });
    else cache.delete(key);
    return data || (c && c.data) || null;
  });
  cache.set(key, { ...(c || {}), pending });
  return pending;
}

// Henter flydata for gitte flyplasser (IATA-koder) og ev. bestemte flightnumre.
export async function loadFlydata(airports = [], flights = []) {
  const codes = [...new Set(airports.filter(Boolean))].sort();
  const ids = [...new Set(flights.map(flightId).filter(Boolean))].sort();
  if (FLYDATA_WORKER && codes.length) {
    const q = `airports=${codes.join(',')}${ids.length ? `&flights=${ids.join(',')}` : ''}`;
    const d = await cached('w:' + q, () => getJson(`${FLYDATA_WORKER.replace(/\/$/, '')}/flydata?${q}`));
    if (d) return d;
  }
  return cached('raw', () => getJson(RAW_URL));
}

// Flyplasskoder og flightnumre for flyetappene i en eller flere reiser.
export function flightQuery(legs) {
  const air = legs.filter((l) => l.mode === 'air');
  return {
    airports: air.flatMap((l) => [airportCode(l.from.name), airportCode(l.to.name)]).filter(Boolean),
    flights: air.map((l) => flightId(l.code)).filter(Boolean),
  };
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
  const id = flightId(leg.code);
  const t = new Date(leg.aimedStart || leg.start).getTime();
  const ta = new Date(leg.aimedEnd || leg.end).getTime();
  let best = null, bd = Infinity;
  for (const f of data.flights) {
    if (f.id !== id) continue;
    const d = f.std ? Math.abs(new Date(f.std).getTime() - t) : f.sta ? Math.abs(new Date(f.sta).getTime() - ta) : Infinity;
    if (d < bd && d < 3 * 3600e3) { bd = d; best = f; }
  }
  return best;
}

// Hvor gamle Avinor-dataene kan være før vi slutter å stole på dem.
export const FRESH_MIN = 30;     // gate, innsjekk og bånd vises bare innenfor denne grensen
export const USABLE_MIN = 180;   // eldre enn dette: Avinor-data brukes ikke i det hele tatt

export function flydataAgeMin(data, now = Date.now()) {
  const t = data && data.updated ? new Date(data.updated).getTime() : NaN;
  return Number.isFinite(t) ? Math.max(0, Math.round((now - t) / 60000)) : Infinity;
}

// Alt vi vet om én flyetappe fra Avinor, eller null. Felt som er for gamle til å stole på, er utelatt.
export function flightInfo(data, leg, now = Date.now()) {
  const f = matchFlight(data, leg);
  if (!f) return null;
  const age = flydataAgeMin(data, now);
  if (age > USABLE_MIN) return null;
  const fresh = age <= FRESH_MIN;
  const [ac, at] = f.arr || [];
  const [dc, dt] = f.dep || [];
  const at_ = hmLocal(data.updated);
  return {
    id: f.id, fresh, age, updated: data.updated,
    status: fresh ? `${statusText(f)} · Avinor ${at_}` : `${statusText(f)} (sist oppdatert ${at_} – sjekk skjermene på flyplassen)`,
    gate: fresh ? f.gate || undefined : undefined,
    checkIn: fresh ? f.checkIn || undefined : undefined,
    belt: fresh ? f.belt || undefined : undefined,
    beltAirport: fresh && f.belt ? airportShort(leg.to.name) : undefined,
    landed: ac === 'A',
    departed: dc === 'D',
    cancelled: dc === 'C' || ac === 'C',
    // Beste anslag for avgang og ankomst: faktisk/ny tid fra Avinor, ellers rutetid
    etd: (dc === 'D' || dc === 'E') && dt ? new Date(dt) : null,
    eta: (ac === 'A' || ac === 'E') && at ? new Date(at) : null,
  };
}

// Legg Avinor-data inn i flight-objektet på en flyetappe (returnerer ny etappe).
export function withFlightInfo(leg, info) {
  if (!info) return leg;
  const { gate, checkIn, belt, beltAirport, ...rest } = leg.flight || {};
  return {
    ...leg,
    flight: {
      ...rest, status: info.status, updated: info.updated,
      ...(info.fresh ? { gate: info.gate, checkIn: info.checkIn, belt: info.belt, beltAirport: info.beltAirport } : {}),
    },
  };
}

// Legg Avinor-data inn i flyetappene i reiselista (muterer reisene).
// Ferske data (≤ 30 min): status, gate, innsjekk og bånd, med klokkeslett for oppdateringen.
// 30 min–3 t: bare status, tydelig merket med hvor gammel den er. Eldre: Enturs egen status beholdes.
export async function enrichFlights(trips) {
  const legs = trips.flatMap((t) => t.legs);
  const q = flightQuery(legs);
  if (!q.flights.length) return false;
  const data = await loadFlydata(q.airports, q.flights);
  if (!data) return false;
  let changed = false;
  trips.forEach((t) => t.legs.forEach((leg) => {
    if (leg.mode !== 'air') return;
    const info = flightInfo(data, leg);
    if (!info) return;
    leg.flight = withFlightInfo(leg, info).flight; // samme etappeobjekt: trip.firstTransit peker hit
    changed = true;
  }));
  return changed;
}
