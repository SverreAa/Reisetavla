import { SuggestionList } from 'reisetavla-ds';

export const Typing = () => (
  <div style={{ width: 360 }}>
    <SuggestionList items={[
      { name: 'Min posisjon', sub: 'Bruk GPS', kind: 'me' },
      { name: 'Nationaltheatret', sub: 'Oslo', kind: 'stop' },
      { name: 'Nesoddtangen brygge', sub: 'Nesodden', kind: 'stop' },
      { name: 'Karl Johans gate 22', sub: 'Oslo', kind: 'addr' },
    ]} />
  </div>
);
export const PositionOnly = () => (
  <div style={{ width: 360 }}>
    <SuggestionList items={[{ name: 'Min posisjon', sub: 'Bruk GPS', kind: 'me' }]} />
  </div>
);
