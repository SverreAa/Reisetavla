import { SearchCard, SegmentedControl, WarningLine, Button, ResultHeader, TripCard, EmptyState, Skeleton } from 'reisetavla-ds';
import { usePlaceField } from '../lib/usePlaceField.jsx';
import { tripCardProps, outsideInfo } from '../lib/view.js';
import { fmtM, MODES } from '../lib/format.js';

const WHEN = [{ id: 'now', label: 'Nå' }, { id: 'depart', label: 'Avreise' }, { id: 'arrive', label: 'Ankomst' }];

function whenText(s) {
  if (s.when === 'now') return 'avreise nå';
  const d = new Date(`${s.date}T${s.time}`), today = new Date().toDateString() === d.toDateString();
  return `${s.when === 'arrive' ? 'ankomst' : 'avreise'} ${today ? '' : `${d.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })} `}${s.time}`;
}

export default function Results(p) {
  const { search, setSearch, shown, maxWalk, excluded, allModes } = p;
  const setField = (k) => (v) => setSearch((s) => ({ ...s, [k]: v }));
  const from = usePlaceField(search.from, setField('from'), p);
  const to = usePlaceField(search.to, setField('to'), p);

  const exclCodes = excluded.map((e) => e.code);
  const modesText = allModes ? '' : ' · ' + MODES.filter((m) => search.modes.includes(m[0])).map((m) => m[1]).join(', ');
  const summary = `Maks gange ${fmtM(maxWalk)} · ${exclCodes.length ? 'Uten ' + exclCodes.join(', ') : 'Alle ruter'}${modesText}`;
  const outside = shown.outside ? outsideInfo(shown.best, maxWalk) : null;
  const n = shown.list.length;
  const title = search.from && search.to ? `${search.from.name} → ${search.to.name}` : 'Reiser';

  let body;
  if (!search.to) {
    body = search.from
      ? <EmptyState title="Hvor skal du?" text={`Velg TIL for å få reiseforslag. Vil du se avganger fra ${search.from.name}, åpne Avganger.`} action="Vis avganger" onAction={p.goBoard} />
      : <EmptyState title="Hvor skal du?" text="Velg FRA og TIL. Kun TIL bruker posisjonen din som start." />;
  } else if (!search.from) {
    body = <EmptyState title="Hvor reiser du fra?" text="Velg FRA, eller trykk i Fra-feltet og velg Min posisjon." />;
  } else if (p.error) {
    body = <EmptyState title="Fikk ikke hentet reiser" text={`${p.error}. Sjekk nettforbindelsen og prøv igjen.`} action="Prøv igjen" onAction={p.retry} />;
  } else if (p.loading && !n) {
    body = <Skeleton count={3} />;
  } else if (!n && shown.hidden) {
    body = <div className="app-card app-muted">Ingen reiser uten de ekskluderte rutene. Ta med en rute igjen under Reisevalg.</div>;
  } else if (!n) {
    body = <EmptyState title="Ingen reiser funnet" text="Prøv flere transportmidler, lengre maks gange eller et annet tidspunkt." />;
  } else {
    body = (
      <ul className="rt-list" aria-live="polite">
        {shown.list.map((t) => (
          <TripCard
            key={t.key}
            {...tripCardProps(t, { outside: shown.outside, maxWalk })}
            expanded={p.openTripKey === t.key}
            onToggle={(open) => p.setOpenTripKey(open ? t.key : null)}
            actions={<>
              <Button icon="pin" onClick={() => p.openMap(t)}>Vis i kart</Button>
              {p.shareTrip && <Button variant="ghost" icon="share" onClick={() => p.shareTrip(t)}>Del reisen</Button>}
            </>}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <SearchCard
        idPrefix="sok" fromInputProps={from.inputProps} toInputProps={to.inputProps} fromExtra={from.extra} toExtra={to.extra}
        onClearFrom={search.from ? () => setField('from')(null) : undefined} onClearTo={search.to ? () => setField('to')(null) : undefined}
        onSwap={() => setSearch((s) => ({ ...s, from: s.to, to: s.from }))}
      >
        <div className="app-when">
          <SegmentedControl label="Tidspunkt" value={search.when} options={WHEN} onChange={(w) => setSearch((s) => ({ ...s, when: w }))} />
          {search.when !== 'now' && (
            <div className="app-dt">
              <input id="sok-tid" type="time" aria-label="Klokkeslett" value={search.time} onChange={(e) => e.target.value && setSearch((s) => ({ ...s, time: e.target.value }))} />
              <input id="sok-dato" type="date" aria-label="Dato" value={search.date} onChange={(e) => e.target.value && setSearch((s) => ({ ...s, date: e.target.value }))} />
            </div>
          )}
        </div>
        <button type="button" className="app-filter-row" onClick={p.openFilter}>
          <span className="txt"><span className="app-eyebrow">Reisevalg</span><span className="sum">{summary}</span></span>
          <span className="edit">Endre</span>
        </button>
      </SearchCard>

      {outside && (
        <div className="app-card app-outside">
          <WarningLine>{outside.text}</WarningLine>
          {outside.raiseTo && <div><Button variant="ghost" onClick={() => p.setMaxWalk(outside.raiseTo)}>{outside.raiseLabel}</Button></div>}
        </div>
      )}

      {search.from && search.to && (
        <ResultHeader title={title} subtitle={`${whenText(search)} · ${n === 1 ? '1 forslag' : `${n} forslag`}`} saved={p.isSaved} onSave={p.toggleSave} onShare={p.openShare} />
      )}

      {shown.hidden > 0 && n > 0 && (
        <div className="app-hidden">
          <span>{`${shown.hidden} forslag skjult fordi ${exclCodes.join(', ')} er ekskludert.`}</span>
          <button type="button" onClick={p.openFilter}>Endre</button>
        </div>
      )}

      {body}

      <section className="app-card app-feedback-card">
        <div>
          <b className="app-card-title">Hjelp oss å gjøre appen bedre</b>
          <p className="app-muted">Fortell hva som mangler eller ikke virker.</p>
        </div>
        <Button variant="ghost" className="app-wide" onClick={p.openFeedback}>Gi tilbakemelding</Button>
      </section>
    </>
  );
}
