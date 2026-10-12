import { useState } from 'react';
import { BottomSheet, Switch, Button } from 'reisetavla-ds';
import { load, save } from '../lib/store.js';

// Sett adressen når et endepunkt finnes. Til da lagres tilbakemeldingene på enheten.
export const FEEDBACK_URL = '';
const APP_VERSION = '2.0.0';
const CATS = ['Forslag', 'Feil i rutedata', 'Noe virket ikke', 'Annet'];

export default function FeedbackSheet({ search, excluded, maxWalk, onClose, onSent }) {
  const [cat, setCat] = useState('Forslag');
  const [text, setText] = useState('');
  const [attach, setAttach] = useState(true);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim()) { setHint('Skriv noen ord før du sender.'); return; }
    const body = {
      category: cat, text: text.trim(), appVersion: APP_VERSION, platform: navigator.userAgent, sentAt: new Date().toISOString(),
      search: attach ? { from: search.from?.name || null, to: search.to?.name || null, when: search.when, time: search.when === 'now' ? null : `${search.date} ${search.time}`, modes: search.modes, maxWalk, excluded: excluded.map((e) => e.code) } : null,
    };
    if (FEEDBACK_URL) {
      setBusy(true);
      try {
        const r = await fetch(FEEDBACK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        onSent('Tilbakemeldingen er sendt');
      } catch (e) {
        setHint('Fikk ikke sendt tilbakemeldingen. Sjekk nettforbindelsen og prøv igjen.');
      } finally { setBusy(false); }
      return;
    }
    save({ feedbackQueue: [...(load().feedbackQueue || []), body] });
    onSent('Tilbakemeldingen er lagret');
  };

  return (
    <BottomSheet title="Gi tilbakemelding" onClose={onClose}>
      <p className="app-muted app-lead">Hva kan vi gjøre bedre? Vi leser alt, men svarer ikke på hver melding.</p>
      <div className="app-cats" role="group" aria-label="Kategori">
        {CATS.map((c) => <button key={c} type="button" className="app-cat" aria-pressed={String(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <label className="app-textarea">
        <span className="app-eyebrow">Din tilbakemelding</span>
        <textarea id="tilbakemelding" rows={4} value={text} placeholder="Beskriv hva du opplevde eller ønsker deg" onChange={(e) => { setText(e.target.value); setHint(''); }} />
      </label>
      {hint && <p className="app-hint" role="alert">{hint}</p>}
      <div className="app-switch-row">
        <span className="grow">Legg ved dette reisesøket</span>
        <Switch checked={attach} label="Legg ved reisesøket" onChange={setAttach} />
      </div>
      <Button onClick={send} disabled={busy}>Send tilbakemelding</Button>
    </BottomSheet>
  );
}
