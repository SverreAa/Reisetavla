// Henter flydata fra Avinor (gate, innsjekk, status, bagasjebånd) for alle Avinors flyplasser
// og skriver én kompakt JSON-fil: node scripts/flydata.mjs [utfil]
// Reserve for Cloudflare Worker-en (worker/): kjøres av GitHub Actions (.github/workflows/flydata.yml).
// Tolkingen deles med Worker-en i worker/src/avinor.js.
import { writeFileSync } from 'node:fs';
import { AIRPORTS, fetchAirportXml, parseAirport, mergeFlights } from '../worker/src/avinor.js';

const all = [], errors = [];
for (const code of AIRPORTS) {
  try { all.push(...parseAirport(code, await fetchAirportXml(code))); } catch (e) { errors.push(String(e.message || e)); }
}
const flights = mergeFlights(all);
const out = { updated: new Date().toISOString(), source: 'Avinor', airports: AIRPORTS.length - errors.length, errors, flights };
const file = process.argv[2] || 'flydata.json';
writeFileSync(file, JSON.stringify(out));
console.log(`${flights.length} flygninger fra ${out.airports} flyplasser → ${file}${errors.length ? ` (feil: ${errors.join(', ')})` : ''}`);
if (!flights.length) process.exit(1);
