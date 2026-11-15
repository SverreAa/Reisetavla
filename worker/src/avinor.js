// Avinors åpne flydata (XmlFeed v1.0): henting og tolking for én flyplass, og sammenslåing
// av avgang (ved avreiseflyplassen) og ankomst (ved ankomstflyplassen) til én post per flygning.
// Brukes både av Cloudflare Worker-en (worker/src/index.js) og av reservejobben på GitHub (scripts/flydata.mjs).

export const FEED = 'https://asrv.avinor.no/XmlFeed/v1.0';
export const USER_AGENT = 'reisetavla (github.com/SverreAa/Reisetavla)';

// Avinors flyplasser. Rekkefølgen brukes ikke til noe.
export const AIRPORTS = ['OSL', 'BGO', 'TRD', 'SVG', 'TOS', 'BOO', 'AES', 'KRS', 'HAU', 'MOL', 'KSU', 'EVE', 'BDU', 'ALF', 'LKL', 'HFT',
  'HVG', 'MEH', 'VDS', 'KKN', 'BVG', 'SOJ', 'VAW', 'BJF', 'SSJ', 'MQN', 'MJF', 'RVK', 'ANX', 'LKN', 'SVJ', 'BNN', 'SKN', 'SOG',
  'FDE', 'FRO', 'SDN', 'HOV', 'OSY', 'RRS', 'RET', 'NVK', 'HAA', 'VDB', 'LYR'];

const RX = {};
const tag = (xml, t) => { const re = RX[t] || (RX[t] = new RegExp(`<${t}>([^<]*)</${t}>`)); const m = re.exec(xml); return m ? m[1].trim() : null; };
const STATUS_RX = /<status code="([A-Z])"(?: time="([^"]*)")?/;

export function airportUrl(code) {
  return `${FEED}?airport=${code}&TimeFrom=2&TimeTo=16`;
}

// Tolker XML-svaret for én flyplass til en liste med rader (én per avgang eller ankomst).
export function parseAirport(code, xml) {
  return [...xml.matchAll(/<flight [^>]*>([\s\S]*?)<\/flight>/g)].map((m) => {
    const f = m[1];
    const st = STATUS_RX.exec(f);
    return {
      at: code, id: tag(f, 'flight_id'), dir: tag(f, 'arr_dep'), other: tag(f, 'airport'), time: tag(f, 'schedule_time'),
      gate: tag(f, 'gate'), checkIn: tag(f, 'check_in'), belt: tag(f, 'belt') || tag(f, 'belt_number'),
      status: st ? st[1] : null, statusTime: st && st[2] ? st[2] : null, delayed: tag(f, 'delayed') === 'Y',
    };
  }).filter((x) => x.id && x.time);
}

// Slår sammen rader fra flere flyplasser til én post per flygning, uten tomme felt.
export function mergeFlights(all) {
  const flights = [];
  const arrBy = new Map(); // «id|ankomstflyplass|fra» → ankomstrader
  for (const x of all) if (x.dir === 'A') { const k = `${x.id}|${x.at}|${x.other}`; (arrBy.get(k) || arrBy.set(k, []).get(k)).push(x); }
  const used = new Set();
  for (const d of all) {
    if (d.dir !== 'D') continue;
    const t = new Date(d.time).getTime();
    const a = (arrBy.get(`${d.id}|${d.other}|${d.at}`) || []).find((x) => { const dt = new Date(x.time).getTime() - t; return dt >= 0 && dt < 16 * 3600e3; });
    if (a) used.add(a);
    flights.push({
      id: d.id, from: d.at, to: d.other, std: d.time, sta: a ? a.time : null,
      gate: d.gate, checkIn: d.checkIn, dep: d.status ? [d.status, d.statusTime] : null, delayed: d.delayed,
      belt: a ? a.belt : null, arr: a && a.status ? [a.status, a.statusTime] : null,
    });
  }
  // Ankomster fra utlandet eller fra flyplasser vi ikke har avgangsdata for
  for (const a of all) {
    if (a.dir !== 'A' || used.has(a)) continue;
    flights.push({ id: a.id, from: a.other, to: a.at, std: null, sta: a.time, gate: null, checkIn: null, dep: null, delayed: a.delayed, belt: a.belt, arr: a.status ? [a.status, a.statusTime] : null });
  }
  return flights.map((f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== null && v !== false && v !== '')));
}

// Avinor sender latin1 (ISO-8859-1): hver byte er ett tegn. Dekodes for hånd, så det virker likt i Node og i Workers.
export function latin1(buf) {
  try { return new TextDecoder('latin1').decode(buf); } catch (e) { /* ikke støttet: dekod for hånd */ }
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return s;
}

export async function fetchAirportXml(code, init = {}) {
  const r = await fetch(airportUrl(code), { ...init, headers: { 'User-Agent': USER_AGENT, ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`${code}: HTTP ${r.status}`);
  return latin1(await r.arrayBuffer());
}
