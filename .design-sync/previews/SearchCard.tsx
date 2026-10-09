import { SearchCard, SegmentedControl, ModeChip } from 'reisetavla-ds';

const when = [{ id: 'now', label: 'Nå' }, { id: 'depart', label: 'Avreise' }, { id: 'arrive', label: 'Ankomst' }];
export const Filled = () => (
  <div style={{ width: 380 }}>
    <SearchCard from="Nationaltheatret" to="Oslo lufthavn" idPrefix="f">
      <SegmentedControl label="Tidspunkt" value="now" options={when} />
      <div className="rt-modes">
        <ModeChip mode="rail" /><ModeChip mode="coach" /><ModeChip mode="bus" pressed={false} /><ModeChip mode="metro" pressed={false} />
      </div>
    </SearchCard>
  </div>
);
export const Empty = () => (
  <div style={{ width: 380 }}>
    <SearchCard idPrefix="e">
      <SegmentedControl label="Tidspunkt" value="now" options={when} />
    </SearchCard>
  </div>
);
