import { IconButton } from 'reisetavla-ds';

export const Save = () => <IconButton icon="star" label="Lagre reisen" />;
export const Saved = () => <IconButton icon="star" label="Fjern lagret reise" pressed />;
export const Share = () => <IconButton icon="share" label="Del oppsettet" />;
export const Inset = () => (
  <div style={{ background: 'var(--surface)', padding: 14, borderRadius: 22 }}>
    <IconButton icon="swap" label="Bytt fra og til" inset />
  </div>
);
