import { BottomSheet, Button } from 'reisetavla-ds';

export const Share = () => (
  <div style={{ width: 390, height: 460, display: 'flex' }}>
    <BottomSheet title="Del reiseoppsettet" inline>
      <dl>
        <dt>Fra</dt><dd>Nationaltheatret</dd>
        <dt>Til</dt><dd>Oslo lufthavn</dd>
        <dt>Tid</dt><dd>avreise nå</dd>
        <dt>Med</dt><dd>Tog, Ekspressbuss</dd>
      </dl>
      <input id="share-link" readOnly defaultValue="https://din-side.no/reisetavla/?fra=NSR%3AStopPlace%3A58404" aria-label="Lenke" />
      <div className="row"><Button variant="ghost">Kopier lenke</Button><Button>Del …</Button></div>
      <Button variant="ghost">Lukk</Button>
    </BottomSheet>
  </div>
);
