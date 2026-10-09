import { EmptyState } from 'reisetavla-ds';

const box = (n: any) => <div style={{ width: 360 }}>{n}</div>;
export const Error = () => box(<EmptyState title="Fikk ikke hentet reiser" text="HTTP 503. Sjekk nettforbindelsen og prøv igjen." action="Prøv igjen" />);
export const NoResults = () => box(<EmptyState title="Ingen reiser funnet" text="Prøv flere transportmidler eller et annet tidspunkt." />);
export const Start = () => box(<EmptyState title="Velg FRA, TIL eller begge" text="Kun FRA gir avgangstavle. Kun TIL bruker posisjonen din som start. Begge gir reiseforslag." />);
