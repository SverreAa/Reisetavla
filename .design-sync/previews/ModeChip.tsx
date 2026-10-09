import { ModeChip } from 'reisetavla-ds';

export const On = () => <ModeChip mode="rail" />;
export const Off = () => <ModeChip mode="rail" pressed={false} />;
export const AllModes = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: 380 }}>
    <ModeChip mode="bus" /><ModeChip mode="rail" /><ModeChip mode="metro" /><ModeChip mode="tram" />
    <ModeChip mode="water" pressed={false} /><ModeChip mode="coach" /><ModeChip mode="air" pressed={false} />
  </div>
);
