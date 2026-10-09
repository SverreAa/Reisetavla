import { TripCard } from 'reisetavla-ds';

const wrap = (node: any) => <ul className="rt-list" style={{ width: 380 }}>{node}</ul>;

export const Direct = () => wrap(
  <TripCard dep="08:42" arr="09:17" duration="35 min" soon="om 4 min" realtime platform="Spor 2"
    legs={[
      { mode: 'foot', minutes: 3, duration: 3 },
      { mode: 'rail', code: 'F2', duration: 29 },
      { mode: 'foot', minutes: 3, duration: 3 },
    ]} />
);

export const WithChange = () => wrap(
  <TripCard dep="08:51" arr="09:38" duration="47 min" soon="om 13 min" realtime platform="Plattform A"
    legs={[
      { mode: 'foot', minutes: 4, duration: 4 },
      { mode: 'metro', code: '2', duration: 9 },
      { mode: 'foot', minutes: 4, duration: 4 },
      { mode: 'rail', code: 'R11', duration: 27 },
      { mode: 'foot', minutes: 3, duration: 3 },
    ]} />
);

export const Delayed = () => wrap(
  <TripCard dep="08:55" wasDep="08:52" arr="09:41" duration="46 min" soon="om 17 min" realtime
    legs={[
      { mode: 'foot', minutes: 4, duration: 4 },
      { mode: 'coach', code: 'FB2', duration: 42 },
    ]}
    warnings={['Sporarbeid gir noe lengre reisetid denne helgen.']} />
);

export const Cancelled = () => wrap(
  <TripCard dep="09:05" arr="09:44" duration="39 min" soon="om 27 min"
    legs={[
      { mode: 'foot', minutes: 2, duration: 2 },
      { mode: 'tram', code: '12', duration: 11 },
      { mode: 'bus', code: '31', duration: 24 },
      { mode: 'foot', minutes: 2, duration: 2 },
    ]}
    cancelled />
);

export const Expanded = () => wrap(
  <TripCard dep="08:42" arr="09:17" duration="35 min" soon="om 4 min" realtime platform="Spor 2" open
    legs={[
      { mode: 'foot', minutes: 3, duration: 3, start: '08:39', to: 'Nationaltheatret', meters: 240 },
      { mode: 'rail', code: 'F2', duration: 29, start: '08:42', end: '09:11', towards: 'Oslo lufthavn', from: 'Nationaltheatret', to: 'Oslo lufthavn', platform: '2', operator: 'Flytoget', realtime: true },
      { mode: 'foot', minutes: 3, duration: 3, start: '09:11', to: 'Ankomsthallen' },
    ]} />
);
