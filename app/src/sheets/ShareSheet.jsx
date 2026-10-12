import { BottomSheet, Button } from 'reisetavla-ds';
import { shareUrl } from '../lib/share.js';
import { MODES } from '../lib/format.js';

export default function ShareSheet({ search, allModes, onClose, onToast }) {
  const url = shareUrl(search, allModes);
  const when = search.when === 'now' ? 'avreise nå' : `${search.when === 'arrive' ? 'ankomst' : 'avreise'} ${search.time}`;
  const modes = allModes ? 'Alle transportmidler' : MODES.filter((m) => search.modes.includes(m[0])).map((m) => m[1]).join(', ');
  const copy = (e) => {
    const input = e.currentTarget.closest('.rt-sheet').querySelector('#del-lenke');
    const fallback = () => { input.select(); onToast('Marker og kopier lenken'); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => onToast('Lenken er kopiert'), fallback); else fallback();
  };
  return (
    <BottomSheet title="Del reiseoppsettet" onClose={onClose}>
      <dl>
        <dt>Fra</dt><dd>{search.from?.name || 'Valgfritt'}</dd>
        <dt>Til</dt><dd>{search.to?.name || 'Valgfritt'}</dd>
        <dt>Tid</dt><dd>{when}</dd>
        <dt>Med</dt><dd>{modes}</dd>
      </dl>
      <input id="del-lenke" readOnly value={url} aria-label="Lenke" />
      <div className="row">
        <Button variant="ghost" onClick={copy}>Kopier lenke</Button>
        {navigator.share && <Button onClick={() => navigator.share({ title: 'Reisetavla', url }).catch(() => {})}>Del …</Button>}
      </div>
      <Button variant="ghost" onClick={onClose}>Lukk</Button>
    </BottomSheet>
  );
}
