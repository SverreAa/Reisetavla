import { EmptyState, SavedChip, ResultHeader } from 'reisetavla-ds';

export default function Saved({ saved, setSaved, open }) {
  return (
    <>
      <ResultHeader title="Mine reiser" subtitle={saved.length ? `${saved.length} lagret på denne enheten` : 'Lagret på denne enheten'} onSave={null} onShare={null} />
      {!saved.length && <EmptyState title="Ingen lagrede reiser ennå" text="Søk etter en reise og trykk på stjernen for å lagre den her." />}
      {saved.length > 0 && (
        <div className="app-saved">
          {saved.map((s, i) => (
            <SavedChip key={s.q + i} name={s.name} onOpen={() => open(s)} onRemove={() => setSaved(saved.filter((x) => x !== s))} />
          ))}
        </div>
      )}
    </>
  );
}
