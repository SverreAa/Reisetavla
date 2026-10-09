import { SegmentedControl } from 'reisetavla-ds';

const when = [{ id: 'now', label: 'Nå' }, { id: 'depart', label: 'Avreise' }, { id: 'arrive', label: 'Ankomst' }];
const box = (n: any) => <div style={{ width: 340, background: 'var(--surface)', padding: 14, borderRadius: 22 }}>{n}</div>;
export const Now = () => box(<SegmentedControl label="Tidspunkt" value="now" options={when} />);
export const Arrive = () => box(<SegmentedControl label="Tidspunkt" value="arrive" options={when} />);
