import { ResultHeader } from 'reisetavla-ds';

const box = (n: any) => <div style={{ width: 380 }}>{n}</div>;
export const Trip = () => box(<ResultHeader title="Nationaltheatret → Oslo lufthavn" subtitle="avreise nå · Tog, Ekspressbuss" saved />);
export const Board = () => box(<ResultHeader title="Avganger fra Jernbanetorget" subtitle="avreise nå · Alle transportmidler · 120 m unna" />);
