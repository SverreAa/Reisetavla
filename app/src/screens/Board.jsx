import { useEffect, useState } from 'react';
import { DepartureRow, EmptyState, Skeleton, ResultHeader } from 'reisetavla-ds';
import { usePlaceField } from '../lib/usePlaceField.jsx';
import * as entur from '../lib/entur.js';
import { hm, minsFromNow, MODES } from '../lib/format.js';

const DEMO_DEST = ['Ellingsrudåsen', 'Sognsvann', 'Vestli', 'Lysaker', 'Drammen', 'Lillestrøm', 'Kolsås', 'Ljabru', 'Bekkestua', 'Majorstuen'];
const DEMO_LINES = { bus: [['31', 'Ruter'], ['20', 'Ruter']], rail: [['F2', 'Flytoget'], ['R11', 'Vy']], metro: [['5', 'Ruter'], ['2', 'Ruter']], tram: [['12', 'Ruter'], ['19', 'Ruter']], water: [['B10', 'Ruter']] };

function demoBoard(modes) {
  const sel = Object.keys(DEMO_LINES).filter((m) => modes.includes(m));
  const out = []; let t = new Date();
  for (let i = 0; i < 14 && sel.length; i++) {
    t = new Date(t.getTime() + (1 + ((i * 7) % 4)) * 60000);
    const m = sel[i % sel.length], [code, auth] = DEMO_LINES[m][i % DEMO_LINES[m].length];
    out.push({ realtime: true, cancellation: i === 6, aimedDepartureTime: t, expectedDepartureTime: new Date(t.getTime() + (i === 3 ? 120000 : 0)), quay: { publicCode: m === 'rail' ? String(1 + (i % 4)) : 'ABCD'[i % 4] }, destinationDisplay: { frontText: DEMO_DEST[i % DEMO_DEST.length] }, serviceJourney: { journeyPattern: { line: { publicCode: code, transportMode: m, authority: { name: auth } } } } });
  }
  return out;
}

export default function Board(p) {
  const { search, setSearch, live, allModes } = p;
  const [stop, setStop] = useState(null);
  const [calls, setCalls] = useState(null);
  const [err, setErr] = useState(null);
  const field = usePlaceField(search.from, (v) => setSearch((s) => ({ ...s, from: v })), p);

  useEffect(() => {
    let alive = true;
    const go = async () => {
      if (!search.from) { setCalls(null); setStop(null); return; }
      setErr(null);
      try {
        if (!live) { setStop(search.from); setCalls(demoBoard(search.modes)); return; }
        const st = await entur.resolveStop(search.from); if (!alive) return; setStop(st);
        const c = await entur.fetchBoard(st, { ...search, allModes }); if (alive) setCalls(c);
      } catch (e) { if (alive) { setErr(e.message); setCalls([]); } }
    };
    go();
    const iv = search.when === 'now' ? setInterval(() => !document.hidden && go(), live ? 30000 : 60000) : null;
    return () => { alive = false; if (iv) clearInterval(iv); };
  }, [search, live, allModes]);

  const modesText = allModes ? 'Alle transportmidler' : MODES.filter((m) => search.modes.includes(m[0])).map((m) => m[1]).join(', ');
  return (
    <>
      <section className="rt-card" aria-label="Velg stopp">
        <div className="rt-field">
          <label htmlFor="avg-stopp">Stopp</label>
          <input id="avg-stopp" autoComplete="off" enterKeyHint="search" placeholder="Stopp eller adresse" {...field.inputProps} />
          {field.extra}
        </div>
      </section>
      {stop && <ResultHeader title={`Avganger fra ${stop.name}`} subtitle={`${search.when === 'now' ? 'avreise nå' : search.time} · ${modesText}${stop.dist ? ` · ${stop.dist} m unna` : ''}`} onSave={null} onShare={null} />}
      {!search.from && <EmptyState title="Velg et stopp" text="Skriv inn et stopp eller en adresse, eller velg Min posisjon for stoppet nærmest deg." />}
      {search.from && err && <EmptyState title="Fikk ikke hentet avganger" text={`${err}. Sjekk nettforbindelsen og prøv igjen.`} />}
      {search.from && !err && calls === null && <Skeleton count={3} />}
      {calls && !err && !calls.length && <EmptyState title="Ingen avganger" text="Ingen avganger med valgte transportmidler i tidsrommet." />}
      {calls && calls.length > 0 && (
        <ul className="rt-list" aria-live="polite">
          {calls.map((c, i) => {
            const line = c.serviceJourney?.journeyPattern?.line || {}, mode = line.transportMode || 'bus';
            const m = minsFromNow(c.expectedDepartureTime), late = new Date(c.expectedDepartureTime) - new Date(c.aimedDepartureTime) >= 60000;
            const when = m <= 0 ? 'nå' : m < 15 ? `${m} min` : hm(c.expectedDepartureTime);
            const sub = c.cancellation ? hm(c.aimedDepartureTime) : (m < 15 && m > 0 ? hm(c.expectedDepartureTime) : (late ? `var ${hm(c.aimedDepartureTime)}` : undefined));
            return (
              <DepartureRow key={i} mode={mode} code={line.publicCode || ''} colour={line.presentation?.colour ? '#' + line.presentation.colour : undefined}
                textColour={line.presentation?.textColour ? '#' + line.presentation.textColour : undefined}
                destination={c.destinationDisplay?.frontText || ''} platform={c.quay?.publicCode} operator={line.authority?.name}
                realtime={c.realtime} when={when} sub={sub} late={late} cancelled={c.cancellation} />
            );
          })}
        </ul>
      )}
    </>
  );
}
