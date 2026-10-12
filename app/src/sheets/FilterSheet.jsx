import { BottomSheet, SegmentedControl, LinePill, Switch, ModeChip, Button } from 'reisetavla-ds';
import { WALKS, MODES } from '../lib/format.js';

// Langt trykk (0,5 s) på en modusbrikke viser bare den. Klikket som følger etter, ignoreres.
const longRef = { fired: false };
function LongPress({ onLong, children }) {
  let timer = null;
  const start = () => { longRef.fired = false; clearTimeout(timer); timer = setTimeout(() => { longRef.fired = true; onLong(); }, 500); };
  const stop = () => clearTimeout(timer);
  return <span className="app-longpress" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onContextMenu={(e) => e.preventDefault()}>{children}</span>;
}

export default function FilterSheet({ maxWalk, setMaxWalk, rows, excluded, setExcluded, modes, setModes, count, onClose }) {
  const isEx = (id) => excluded.some((e) => e.id === id);
  const toggle = (r) => setExcluded(isEx(r.id) ? excluded.filter((e) => e.id !== r.id) : excluded.concat({ id: r.id, code: r.code, mode: r.mode, name: r.name, desc: r.desc }));
  const toggleMode = (m) => {
    const next = modes.includes(m) ? modes.filter((x) => x !== m) : modes.concat(m);
    if (next.length) setModes(MODES.map((x) => x[0]).filter((x) => next.includes(x)));
  };
  return (
    <BottomSheet title="Reisevalg" onClose={onClose}>
      <div className="app-sheet-scroll">
        <div className="app-group">
          <span className="app-eyebrow">Maks gange til og fra stopp</span>
          <SegmentedControl label="Maks gange" value={String(maxWalk)} options={WALKS} onChange={(id) => setMaxWalk(Number(id))} />
          <p className="app-muted">Finnes det ingen stopp innenfor grensen, viser vi det beste alternativet og sier fra.</p>
        </div>
        <div className="app-group tight">
          <span className="app-eyebrow">Ekskluder ruter</span>
          {!rows.length && <p className="app-muted">Rutene i søkeresultatet vises her.</p>}
          {rows.map((r) => {
            const ex = isEx(r.id);
            return (
              <div key={r.id} className="app-switch-row">
                <LinePill mode={r.mode} code={r.code} />
                <div className="grow"><div className="strong">{r.name}</div><div className="app-small">{r.desc}</div></div>
                <span className="app-state">{ex ? 'Ekskludert' : 'Med'}</span>
                <Switch checked={ex} label={`Ekskluder ${r.name}`} onChange={() => toggle(r)} />
              </div>
            );
          })}
        </div>
        <div className="app-group">
          <span className="app-eyebrow">Transportmidler</span>
          <div className="app-mode-wrap">
            <button type="button" className="rt-mode app-mode-all" style={{ '--mc': 'var(--accent)' }} aria-pressed={String(modes.length === MODES.length)} onClick={() => setModes(MODES.map((x) => x[0]))}>Alle</button>
            {MODES.map(([m]) => <LongPress key={m} onLong={() => setModes([m])}><ModeChip mode={m} pressed={modes.includes(m)} onClick={(e) => { if (!longRef.fired) toggleMode(m); longRef.fired = false; }} /></LongPress>)}
          </div>
          <p className="app-small">Trykk for av/på · hold inne for «bare denne»</p>
        </div>
      </div>
      <Button onClick={onClose}>{count ? `Vis ${count} ${count === 1 ? 'reise' : 'reiser'}` : 'Lukk'}</Button>
    </BottomSheet>
  );
}
