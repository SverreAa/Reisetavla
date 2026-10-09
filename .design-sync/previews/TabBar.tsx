import { TabBar } from 'reisetavla-ds';

const box = (n: any) => <div style={{ width: 390 }}>{n}</div>;
export const Trips = () => box(<TabBar active="reiser" />);
export const Departures = () => box(<TabBar active="avganger" />);
