import { WarningLine } from 'reisetavla-ds';

const box = (n: any) => <div style={{ width: 360, background: 'var(--surface)', padding: 14, borderRadius: 20 }}>{n}</div>;
export const Deviation = () => box(<WarningLine>Sporarbeid gir noe lengre reisetid denne helgen.</WarningLine>);
export const Cancelled = () => box(<WarningLine tone="crit">Del av reisen er innstilt.</WarningLine>);
