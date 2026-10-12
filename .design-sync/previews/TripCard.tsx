import { TripCard, Button } from 'reisetavla-ds';

const wrap = (node: any) => <ul className="rt-list" style={{ width: 380 }}>{node}</ul>;

const tramTrip = [
  { mode: 'foot', minutes: 5, meters: 350, duration: 5, start: '07:41', end: '07:46', to: 'Holbergs plass' },
  { mode: 'tram', code: '19', duration: 9, start: '07:46', end: '07:55', towards: 'Ljabru', from: 'Holbergs plass', platform: 'B', to: 'Jernbanetorget', stops: 4, crowd: 3, control: 'Billettkontroll meldt ved Tullinløkka for 12 min siden' },
  { mode: 'foot', minutes: 4, meters: 250, duration: 4, start: '07:55', end: '07:59', to: 'Oslo S' },
  { mode: 'rail', code: 'F2', duration: 19, start: '08:10', end: '08:29', towards: 'Oslo lufthavn', from: 'Oslo S', platform: '13', to: 'Oslo lufthavn', stops: 0, crowd: 1 },
  { mode: 'air', code: 'SK 263', duration: 55, start: '09:30', end: '10:25', from: 'Oslo lufthavn', to: 'Bergen lufthavn, Flesland',
    flight: { number: 'SK 263', airline: 'SAS', status: 'I rute', seats: 14, gate: 'D7', gateOpen: '08:55', bagDrop: '08:50', belt: '3', beltTime: 'ca. 10:40', beltAirport: 'Bergen', aircraft: 'Boeing 737-800' } },
];

export const WithCrowdAndControl = () => wrap(
  <TripCard dep="07:41" arr="10:25" duration="2 t 44 min" soon="om 6 min" realtime platform="Plattform B" legs={tramTrip}
    notices={['Billettkontroll meldt ved Tullinløkka på trikk 19 for 12 min siden']} />
);

export const ExpandedWithFlight = () => wrap(
  <TripCard dep="07:41" arr="10:25" duration="2 t 44 min" soon="om 6 min" realtime platform="Plattform B" legs={tramTrip} open
    actions={<Button icon="pin">Vis i kart</Button>} />
);

export const OutsideMaxWalk = () => wrap(
  <TripCard dep="07:44" arr="10:35" duration="2 t 51 min" soon="om 9 min" realtime platform="Plattform 1"
    legs={[
      { mode: 'foot', minutes: 7, meters: 550, duration: 7 },
      { mode: 'metro', code: '2', duration: 3, crowd: 2 },
      { mode: 'foot', minutes: 3, meters: 150, duration: 3 },
      { mode: 'rail', code: 'R10', duration: 23, crowd: 2 },
      { mode: 'air', code: 'DY 612', duration: 55, flight: { seats: 6 } },
    ]}
    notices={['550 m gange til Nationaltheatret er over maks gange (400 m).']} />
);

export const Delayed = () => wrap(
  <TripCard dep="08:55" wasDep="08:52" arr="09:41" duration="46 min" soon="om 17 min" realtime
    legs={[{ mode: 'foot', minutes: 4, duration: 4 }, { mode: 'coach', code: 'FB2', duration: 42, crowd: 1 }]}
    warnings={['Sporarbeid gir noe lengre reisetid denne helgen.']} />
);

export const Cancelled = () => wrap(
  <TripCard dep="09:05" arr="09:44" duration="39 min" soon="om 27 min"
    legs={[{ mode: 'foot', minutes: 2, duration: 2 }, { mode: 'tram', code: '12', duration: 11 }, { mode: 'bus', code: '31', duration: 24 }, { mode: 'foot', minutes: 2, duration: 2 }]}
    cancelled />
);
