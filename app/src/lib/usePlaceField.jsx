// Felt med forslag fra Entur-geokoderen (eller eksempelstopp i demo). «Min posisjon» står alltid øverst.
import { useRef, useState } from 'react';
import { SuggestionList } from 'reisetavla-ds';

const ME = { id: null, name: 'Min posisjon', sub: 'Bruk GPS', kind: 'me' };

export function myPosition() {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) { rej(new Error('Posisjon er ikke tilgjengelig')); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => res({ id: null, name: 'Min posisjon', lat: p.coords.latitude, lon: p.coords.longitude, kind: 'me' }),
      () => rej(new Error('Fikk ikke tilgang til posisjonen din')),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}

export function usePlaceField(value, onPick, { live, geocode, demoStops, onError }) {
  const [text, setText] = useState(null); // null = vis valgt verdi
  const [items, setItems] = useState(null);
  const seq = useRef(0), timer = useRef(null);

  const show = (list) => setItems([ME, ...list]);
  const local = (q) => demoStops.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.sub || '').toLowerCase().includes(q)).slice(0, 6);

  const pick = async (it) => {
    setItems(null); setText(null);
    if (it.kind === 'me') { try { onPick(await myPosition()); } catch (e) { onError && onError(e.message); } return; }
    onPick(it);
  };

  const inputProps = {
    value: text ?? (value?.name || ''),
    onFocus: () => { if (!text) show(live ? [] : local('')); },
    onChange: (e) => {
      const q = e.target.value; setText(q); clearTimeout(timer.current);
      if (q.trim().length < 2) { show(live ? [] : local('')); return; }
      if (!live) { show(local(q.trim().toLowerCase())); return; }
      timer.current = setTimeout(async () => { const my = ++seq.current; try { const r = await geocode(q.trim()); if (my === seq.current) show(r); } catch (err) { /* nett */ } }, 220);
    },
    onBlur: () => setTimeout(() => { setItems(null); setText(null); }, 150),
    onKeyDown: (e) => {
      if (e.key === 'Escape') { setItems(null); e.currentTarget.blur(); }
      if (e.key === 'Enter' && items && items[1]) { e.preventDefault(); pick(items[1]); e.currentTarget.blur(); }
    },
  };
  const extra = items ? <SuggestionList floating items={items} onSelect={(it) => pick(it)} /> : null;
  return { inputProps, extra };
}
