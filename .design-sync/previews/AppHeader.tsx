import { AppHeader } from 'reisetavla-ds';

const box = (n: any) => <div style={{ width: 360 }}>{n}</div>;
export const Live = () => box(<AppHeader live />);
export const Demo = () => box(<AppHeader live={false} />);
export const Connecting = () => box(<AppHeader statusLabel="Kobler til" />);
