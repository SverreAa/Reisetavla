// Reisetavla flydata – Cloudflare Worker
// Henter Avinors åpne flydata for flyplassene appen spør om, og svarer med samme JSON-format
// som flydata.json fra GitHub-jobben. Avinor avviser forespørsler direkte fra nettlesere,
// så appen spør denne Worker-en i stedet.
//
//   GET /flydata?airports=OSL,BGO               → { updated, source, airports, errors, flights: [...] }
//   GET /flydata?airports=OSL,BGO&flights=WF1403 → bare de oppgitte flightnumrene
//
// Hver flyplass mellomlagres i 3 minutter, så Avinor får høyst én forespørsel per flyplass
// per 3. minutt uansett hvor mange som bruker appen.
import { AIRPORTS, fetchAirportXml, parseAirport, mergeFlights } from './avinor.js';

const TTL_MS = 3 * 60 * 1000;
const MAX_AIRPORTS = 6;
const KNOWN = new Set(AIRPORTS);
const ALLOWED_ORIGINS = ['https://sverreaa.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'];

// Minnebuffer i Worker-instansen. Cloudflare holder instansen varm mellom forespørsler,
// og i tillegg bes Cloudflares egen cache holde på svaret fra Avinor like lenge.
const memo = new Map(); // kode → { at, rows } | { at, error }

async function airport(code) {
  const hit = memo.get(code);
  if (hit && Date.now() - hit.at < TTL_MS) return hit;
  try {
    const xml = await fetchAirportXml(code, { cf: { cacheTtl: TTL_MS / 1000, cacheEverything: true } });
    const entry = { at: Date.now(), rows: parseAirport(code, xml) };
    memo.set(code, entry);
    return entry;
  } catch (e) {
    // Behold forrige svar hvis vi har et, men marker feilen
    if (hit && hit.rows) return { ...hit, error: String(e.message || e) };
    return { at: Date.now(), rows: [], error: String(e.message || e) };
  }
}

function cors(req) {
  const origin = req.headers.get('Origin') || '';
  const h = { 'Vary': 'Origin' };
  if (ALLOWED_ORIGINS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

const json = (req, body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(req), ...extra },
});

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    if (req.method !== 'GET') return json(req, { error: 'Bare GET er støttet' }, 405);

    if (url.pathname === '/' || url.pathname === '') {
      return new Response('Reisetavla flydata. Bruk /flydata?airports=OSL,BGO\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...cors(req) } });
    }
    if (url.pathname !== '/flydata') return json(req, { error: 'Ukjent adresse' }, 404);

    const codes = [...new Set((url.searchParams.get('airports') || '').toUpperCase().split(',').map((s) => s.trim()).filter((c) => KNOWN.has(c)))].slice(0, MAX_AIRPORTS);
    if (!codes.length) return json(req, { error: 'Oppgi flyplasser, f.eks. ?airports=OSL,BGO' }, 400);

    const want = new Set((url.searchParams.get('flights') || '').toUpperCase().replace(/\s+/g, '').split(',').filter(Boolean));
    const results = await Promise.all(codes.map(airport));
    let rows = results.flatMap((r) => r.rows);
    if (want.size) rows = rows.filter((r) => want.has(r.id));
    const errors = results.map((r) => r.error).filter(Boolean);
    const oldest = Math.min(...results.map((r) => r.at));
    const body = { updated: new Date(oldest).toISOString(), source: 'Avinor', airports: codes, errors, flights: mergeFlights(rows) };
    return json(req, body, 200, { 'Cache-Control': 'public, max-age=60' });
  },
};
