import { Button } from 'reisetavla-ds';

export const Primary = () => <Button>Del …</Button>;

export const Ghost = () => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
    <Button variant="ghost">Kopier lenke</Button>
    <Button variant="ghost">Lukk</Button>
  </div>
);

export const WithIcon = () => <Button icon="share">Del reisen</Button>;

export const SheetActions = () => (
  <div style={{ display: 'flex', gap: 10, width: 340 }}>
    <Button variant="ghost" style={{ flex: 1 }}>Kopier lenke</Button>
    <Button style={{ flex: 1 }}>Del …</Button>
  </div>
);
