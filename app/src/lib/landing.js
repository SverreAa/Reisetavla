// Følger flyetappene på en reise i kartvisningen og oppdaterer reisen fortløpende:
// - status, gate, ny avgangs-/ankomsttid og bagasjebånd fra Avinor
// - hyppig sjekk rundt landing (hvert minutt), ellers hvert 3. minutt
// - varsler: ny gate, innstilt, ny ankomsttid, landet, bagasjebånd
// - rekker du ikke videre forbindelse etter landing, hentes et nytt forslag fra Entur
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as entur from './entur.js';
import { hm, MODE_NAME, lower } from './format.js';
import { loadFlydata, flightQuery, flightInfo, withFlightInfo } from './flydata.js';

const MIN = 60000;
export const TRANSFER_MIN = 20;          // tid fra landing til du kan gå videre (av flyet, ev. bagasje)
const GROUND_MODES = ['bus', 'rail', 'metro', 'tram', 'water', 'coach'];
const pad = (n) => String(n).padStart(2, '0');
const ms = (d) => new Date(d).getTime();

// Reisen med Avinor-data lagt inn: nye tider, status, gate og bånd på flyetappene.
function applyInfo(trip, infos) {
  if (!Object.keys(infos).length) return trip;
  const legs = trip.legs.map((l, i) => {
    const inf = infos[i];
    if (!inf) return l;
    const n = withFlightInfo(l, inf);
    const start = inf.etd || l.start, end = inf.eta || l.end;
    return { ...n, start, end, stops: (l.stops || []).map((s, k, a) => (k === 0 ? { ...s, time: start } : k === a.length - 1 ? { ...s, time: end } : s)) };
  });
  const last = legs[legs.length - 1];
  return { ...trip, legs, end: last.mode === 'air' ? last.end : trip.end };
}

function notify(title, body) {
  if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    try { new Notification(title, { body, tag: 'reisetavla-fly' }); } catch (e) { /* ikke støttet */ }
  }
}

// Hendelser som skal vises og varsles når noe endrer seg mellom to sjekker.
function eventsFor(leg, prev, inf, first) {
  const out = [];
  const code = leg.code;
  if (inf.cancelled && !prev.cancelled) out.push({ title: 'Flyet er innstilt', text: `${code} · sjekk skjermene på flyplassen` });
  if (!first && inf.gate && prev.gate && inf.gate !== prev.gate && !inf.departed) out.push({ title: `Ny gate: ${inf.gate}`, text: `${code} · var ${prev.gate}` });
  if (!first && !inf.landed && inf.eta && prev.eta && Math.abs(ms(inf.eta) - ms(prev.eta)) >= 5 * MIN) out.push({ title: `Ny ankomsttid ${hm(inf.eta)}`, text: `${code} til ${leg.to.name}` });
  if (inf.landed && !prev.landed) out.push({ title: `Landet ${inf.eta ? hm(inf.eta) : ''}`.trim(), text: `${code} · ${leg.to.name}` });
  if (inf.belt && inf.belt !== prev.belt) out.push({ title: `Bagasje på bånd ${inf.belt}`, text: `${code} · ${inf.beltAirport || leg.to.name}`, belt: true });
  return out;
}

const dateParts = (d) => { const x = new Date(d); return { date: `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`, time: `${pad(x.getHours())}:${pad(x.getMinutes())}` }; };

export function useFlightWatch(baseTrip, { live }) {
  const [override, setOverride] = useState(null);   // reisen etter at du har valgt ny forbindelse
  const [infos, setInfos] = useState({});           // etappeindeks → Avinor-info
  const [event, setEvent] = useState(null);         // siste hendelse som vises i kartet
  const [connection, setConnection] = useState(null); // status for videre forbindelse etter landing
  const prev = useRef({});
  const infosRef = useRef({});
  const asked = useRef('');

  const trip0 = override || baseTrip;
  const airIdx = useMemo(() => trip0.legs.map((l, i) => (l.mode === 'air' ? i : -1)).filter((i) => i >= 0), [trip0]);

  useEffect(() => { setOverride(null); setInfos({}); infosRef.current = {}; prev.current = {}; setEvent(null); setConnection(null); asked.current = ''; }, [baseTrip.key]);

  // Sjekk flydata: hvert minutt rundt landing, ellers hvert 3. minutt, og ikke langt unna reisen
  useEffect(() => {
    if (!live || !airIdx.length) return undefined;
    let alive = true, timer = null;
    const schedule = (wait) => { if (alive) timer = setTimeout(() => (document.hidden ? schedule(wait) : tick()), wait); };
    const tick = async () => {
      const now = Date.now();
      const active = airIdx.filter((i) => {
        const l = trip0.legs[i], eta = infosRef.current[i]?.eta || l.end;
        return now > ms(l.start) - 6 * 3600e3 && now < ms(eta) + 90 * MIN;
      });
      if (!active.length) { schedule(5 * MIN); return; }
      const q = flightQuery(active.map((i) => trip0.legs[i]));
      const data = await loadFlydata(q.airports, q.flights);
      if (!alive) return;
      const next = {};
      const fresh = [];
      active.forEach((i) => {
        const leg = trip0.legs[i];
        const inf = data ? flightInfo(data, leg) : null;
        if (!inf) return;
        const p = prev.current[i];
        // Første sjekk etter at kartet åpnes: vis i kartet, men ikke vibrer eller send varsel
        fresh.push(...eventsFor(leg, p || {}, inf, !p).map((e) => ({ ...e, quiet: !p })));
        prev.current[i] = { gate: inf.gate || (p && p.gate), eta: inf.eta, landed: inf.landed, belt: inf.belt || (p && p.belt), cancelled: inf.cancelled };
        next[i] = inf;
      });
      if (Object.keys(next).length) {
        infosRef.current = { ...infosRef.current, ...next };
        setInfos(infosRef.current);
      }
      if (fresh.length) {
        const e = fresh[fresh.length - 1];
        setEvent({ ...e, at: Date.now() });
        fresh.filter((x) => !x.quiet).forEach((x) => notify(x.title, x.text));
      }
      const nearLanding = active.some((i) => { const eta = ms(next[i]?.eta || trip0.legs[i].end); return now > eta - 45 * MIN && now < eta + 60 * MIN; });
      schedule(nearLanding ? MIN : 3 * MIN);
    };
    tick();
    const vis = () => { if (!document.hidden) { clearTimeout(timer); tick(); } };
    document.addEventListener('visibilitychange', vis);
    return () => { alive = false; clearTimeout(timer); document.removeEventListener('visibilitychange', vis); };
  }, [live, trip0, airIdx]);

  // Videre forbindelse: rekker du den med ny ankomsttid? Hvis ikke, hent et nytt forslag fra Entur.
  useEffect(() => {
    if (!live) return;
    for (const i of airIdx) {
      const inf = infos[i];
      if (!inf || !inf.eta || inf.cancelled) continue;
      const leg = trip0.legs[i];
      const ni = trip0.legs.findIndex((l, k) => k > i && l.mode !== 'foot');
      if (ni < 0 || trip0.legs[ni].mode === 'air') continue;
      const nl = trip0.legs[ni];
      const walk = trip0.legs.slice(i + 1, ni).reduce((s, l) => s + (l.minutes || 0), 0);
      const slack = Math.round((ms(nl.start) - ms(inf.eta)) / MIN) - walk;
      const late = Math.round((ms(inf.eta) - ms(leg.aimedEnd || leg.end)) / MIN);
      const name = `${lower(MODE_NAME[nl.mode])} ${nl.code}`;
      if (slack >= TRANSFER_MIN) {
        setConnection(late >= 5 ? { kind: 'ok', title: `Du rekker ${name} kl. ${hm(nl.start)}`, text: `${slack} min fra landing til avgang` } : null);
        return;
      }
      const key = `${i}|${hm(inf.eta)}`;
      if (asked.current === key) return;
      asked.current = key;
      setConnection({ kind: 'missed', title: `Du rekker trolig ikke ${name} kl. ${hm(nl.start)}`, text: 'Leter etter ny forbindelse …' });
      const after = new Date(ms(inf.eta) + TRANSFER_MIN * MIN);
      const dest = trip0.legs[trip0.legs.length - 1].to;
      entur.fetchTrips({
        from: { name: leg.to.name, lat: leg.to.lat, lon: leg.to.lon }, to: { name: dest.name, lat: dest.lat, lon: dest.lon },
        when: 'depart', ...dateParts(after), modes: GROUND_MODES, allModes: false,
      }).then((list) => {
        if (asked.current !== key) return;
        const t = list.find((x) => ms(x.start) >= ms(after) - 2 * MIN);
        if (!t) { setConnection({ kind: 'missed', title: `Du rekker trolig ikke ${name} kl. ${hm(nl.start)}`, text: 'Fant ingen ny forbindelse ennå. Prøver igjen ved neste oppdatering.' }); asked.current = ''; return; }
        const ft = t.legs.find((l) => l.mode !== 'foot');
        const combined = {
          ...trip0, key: `${trip0.key}~${t.key}`,
          legs: [...trip0.legs.slice(0, i + 1), ...t.legs],
          end: t.end, minutes: Math.round((ms(t.end) - ms(trip0.start)) / MIN),
        };
        setConnection({
          kind: 'missed', title: `Du rekker trolig ikke ${name} kl. ${hm(nl.start)}`,
          text: `Ny forbindelse: ${ft ? `${lower(MODE_NAME[ft.mode])} ${ft.code} kl. ${hm(ft.start)}` : `gå kl. ${hm(t.start)}`}, fremme ${hm(t.end)}`,
          trip: combined,
        });
      }).catch(() => { asked.current = ''; });
      return;
    }
  }, [infos, trip0, airIdx, live]);

  const accept = useCallback(() => {
    if (connection && connection.trip) { setOverride(connection.trip); setConnection(null); asked.current = ''; }
  }, [connection]);
  const dismissEvent = useCallback(() => setEvent(null), []);

  const trip = useMemo(() => applyInfo(trip0, infos), [trip0, infos]);
  return { trip, event, dismissEvent, connection, accept, infos };
}

// Kort tekst om flyet for etappelista i kartet.
export function flightLine(f) {
  if (!f) return '';
  const parts = [];
  if (f.status) parts.push(f.status.replace(/ · Avinor \d\d:\d\d$/, ''));
  if (f.gate) parts.push(`Gate ${f.gate}`);
  if (f.belt) parts.push(`Bånd ${f.belt}${f.beltAirport ? ` (${f.beltAirport})` : ''}`);
  return parts.join(' · ');
}
