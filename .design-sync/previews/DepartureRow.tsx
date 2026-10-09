import { DepartureRow } from 'reisetavla-ds';

const wrap = (node: any) => <ul className="rt-list" style={{ width: 380 }}>{node}</ul>;

export const Soon = () => wrap(
  <DepartureRow mode="metro" code="5" destination="Vestli" platform="A" operator="Ruter" realtime when="2 min" sub="08:44" />
);

export const Late = () => wrap(
  <DepartureRow mode="tram" code="12" destination="Majorstuen" platform="C" operator="Ruter" realtime when="7 min" sub="var 08:47" late />
);

export const Scheduled = () => wrap(
  <DepartureRow mode="rail" code="R11" destination="Skien" platform="4" operator="Vy" when="09:12" />
);

export const Cancelled = () => wrap(
  <DepartureRow mode="bus" code="31" destination="Tonsenhagen" platform="B" operator="Ruter" when="" sub="08:58" cancelled />
);

export const Board = () => wrap(
  <>
    <DepartureRow mode="metro" code="5" destination="Vestli" platform="A" operator="Ruter" realtime when="nå" />
    <DepartureRow mode="bus" code="20" destination="Galgeberg" platform="D" operator="Ruter" realtime when="4 min" sub="08:46" />
    <DepartureRow mode="rail" code="F2" colour="#949494" textColour="#ffffff" destination="Oslo lufthavn" platform="2" operator="Flytoget" realtime when="9 min" sub="08:51" />
  </>
);
