import { SavedChip } from 'reisetavla-ds';

export const Single = () => <SavedChip name="Hjem → Jobb" />;
export const Row = () => (
  <div className="rt-saved" style={{ width: 380 }}>
    <SavedChip name="Hjem → Jobb" />
    <SavedChip name="Til flyet" />
    <SavedChip name="Majorstuen → avganger" />
  </div>
);
