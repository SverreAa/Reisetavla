// Henter flydata fra Avinor (gate, innsjekk, status, bagasjebånd) for Avinors flyplasser
// og skriver én kompakt JSON-fil appen kan lese: node scripts/flydata.mjs [utfil]
// Kjøres av GitHub Actions (.github/workflows/flydata.yml) omtrent hvert 10. minutt.
// Avinor ber om at klienter ikke spør dem direkte, og tjenesten avviser forespørsler fra nettlesere.
import { writeFileSync } from 'node:fs';

const FEED = 'https://asrv.avinor.no/XmlFeed/v1.0';
const AIRPORTS = ['OSL', 'BGO', 'TRD', 'SVG', 'TOS', 'BOO', 'AES', 'KRS', 'HAU', 'MOL', 'KSU', 'EVE', 'BDU', 'ALF', 'LKL', 'HFT',
  'HVG', 'MEH', 'VDS', 'KKN', 'BVG', 'SOJ', 'VAW', 'BJF', 'SSJ', 'MQN', 'MJF', 'RVK', 'ANX', 'LKN', 'SVJ', 'BNN', 'SKN', 'SOG',
  'FDE', 'FRO', 'SDN', 'HOV', 'OSY', 'RRS', 'RET', 'NVK', 'HAA', 'VDB', 'LYR'];

const tag = (xml, t) => { const m = new RegExp(`<${t}>([^<]*)</${t}>`).exec(xml); return m ? m[1].trim() : null; };

async function airport(code) {
  const r = await fetch(`${FEED}?airport=${code}&TimeFrom=2&TimeTo=16`, { headers: { 'User-Agent': 'reisetavla (github.com/SverreAa/Reisetavla)' } });
  if (!r.ok) throw new Error(`${code}: HTTP ${r.status}`);
  const xml = Buffer.from(await r.arrayBuffer()).toString('latin1');
  return [...xml.matchAll(/<flight [^>]*>([\s\S]*?)<\/flight>/g)].map((m) => {
    const f = m[1];
    const st = /<status code="([A-Z])"(?: time="([^"]*)")?/.exec(f);
    return {
      at: code, id: tag(f, 'flight_id'), dir: tag(f, 'arr_dep'), other: tag(f, 'airport'), time: tag(f, 'schedule_time'),
      gate: tag(f, 'gate'), checkIn: tag(f, 'check_in'), belt: tag(f, 'belt') || tag(f, 'belt_number'),
      status: st ? st[1] : null, statusTime: st && st[2] ? st[2] : null, delayed: tag(f, 'delayed') === 'Y',
    };
  }).filter((x) => x.id && x.time);
}

const all = [], errors = [];
for (const code of AIRPORTS) {
  try { all.push(...await airport(code)); } catch (e) { errors.push(String(e.message || e)); }
}

// Slå sammen avgang (ved avreiseflyplassen) og ankomst (ved ankomstflyplassen) til én post per flygning.
const flights = [];
const dep = all.filter((x) => x.dir === 'D'), arr = all.filter((x) => x.dir === 'A');
for (const d of dep) {
  const a = arr.find((x) => x.id === d.id && x.at === d.other && x.other === d.at && new Date(x.time) - new Date(d.time) >= 0 && new Date(x.time) - new Date(d.time) < 16 * 3600e3);
  flights.push({
    id: d.id, from: d.at, to: d.other, std: d.time, sta: a ? a.time : null,
    gate: d.gate, checkIn: d.checkIn, dep: d.status ? [d.status, d.statusTime] : null, delayed: d.delayed,
    belt: a ? a.belt : null, arr: a && a.status ? [a.status, a.statusTime] : null,
  });
}
// Ankomster fra utlandet eller fra flyplasser uten avgangsdata
for (const a of arr) {
  if (flights.some((f) => f.id === a.id && f.to === a.at && f.sta === a.time)) continue;
  flights.push({ id: a.id, from: a.other, to: a.at, std: null, sta: a.time, gate: null, checkIn: null, dep: null, delayed: a.delayed, belt: a.belt, arr: a.status ? [a.status, a.statusTime] : null });
}
// Fjern tomme felt for å holde filen liten
const slim = flights.map((f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== null && v !== false && v !== '')));

const out = { updated: new Date().toISOString(), source: 'Avinor', airports: AIRPORTS.length - errors.length, errors, flights: slim };
const file = process.argv[2] || 'flydata.json';
writeFileSync(file, JSON.stringify(out));
console.log(`${slim.length} flygninger fra ${out.airports} flyplasser → ${file}${errors.length ? ` (feil: ${errors.join(', ')})` : ''}`);
if (!slim.length) process.exit(1);
