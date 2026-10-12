import { Switch } from 'reisetavla-ds';

export const On = () => <Switch checked label="Varsle før avstigning" />;
export const Off = () => <Switch checked={false} label="Ekskluder Trikk 19" />;
export const InRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, width: 340 }}>
    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>Varsle én stasjon før jeg skal av</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>Vibrerer og viser et varsel</div></div>
    <Switch checked label="Varsle før avstigning" />
  </div>
);
