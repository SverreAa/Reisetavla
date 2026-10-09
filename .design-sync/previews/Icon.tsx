import { Icon } from 'reisetavla-ds';

const row = (names: string[]) => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--ink)' }}>
    {names.map((n) => (
      <div key={n} style={{ display: 'grid', justifyItems: 'center', gap: 4, width: 56, fontSize: 12, color: 'var(--muted)' }}>
        <span style={{ color: 'var(--ink)' }}><Icon name={n as any} /></span>{n}
      </div>
    ))}
  </div>
);
export const Modes = () => row(['bus', 'coach', 'rail', 'metro', 'tram', 'water', 'air', 'foot']);
export const Interface = () => row(['pin', 'me', 'warn', 'star', 'share', 'swap', 'close', 'board']);
