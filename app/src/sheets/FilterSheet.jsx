import { BottomSheet, SegmentedControl, LinePill, Switch, ModeChip, Button } from 'reisetavla-ds';
import { WALKS, MODES } from '../lib/format.js';

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
            {MODES.map(([m]) => <ModeChip key={m} mode={m} pressed={modes.includes(m)} onClick={() => toggleMode(m)} />)}
          </div>
        </div>
      </div>
      <Button onClick={onClose}>{count ? `Vis ${count} ${count === 1 ? 'reise' : 'reiser'}` : 'Lukk'}</Button>
    </BottomSheet>
  );
}
