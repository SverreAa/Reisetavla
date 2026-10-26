import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Root, StatusBadge, TabBar, Toast, Note } from 'reisetavla-ds';
import * as entur from './lib/entur.js';
import { enrichFlights } from './lib/flydata.js';
import { demoTrips, DEMO_SEARCH, DEMO_STOPS } from './lib/demo.js';
import { load, save } from './lib/store.js';
import { MODES } from './lib/format.js';
import { filterTrips, exclusionRows } from './lib/view.js';
import { toParams, fromParams, routeOnly, tripLink } from './lib/share.js';
import Results from './screens/Results.jsx';
import Board from './screens/Board.jsx';
import Saved from './screens/Saved.jsx';
import MapScreen from './screens/MapScreen.jsx';
import FilterSheet from './sheets/FilterSheet.jsx';
import FeedbackSheet from './sheets/FeedbackSheet.jsx';
import ShareSheet from './sheets/ShareSheet.jsx';

const pad = (n) => String(n).padStart(2, '0');
const now0 = new Date();
const ALL_MODES = MODES.map((m) => m[0]);
const FORCE_DEMO = /[?&]demo\b/.test(location.search);

function initialSearch() {
  const base = { from: null, to: null, when: 'now', time: `${pad(now0.getHours())}:${pad(now0.getMinutes())}`, date: `${now0.getFullYear()}-${pad(now0.getMonth() + 1)}-${pad(now0.getDate())}`, modes: ALL_MODES };
  return { ...base, ...fromParams(location.search) };
}

export default function App() {
  const stored = useMemo(load, []);
  const [live, setLive] = useState(null);
  const [tab, setTab] = useState('reiser');
  const [screen, setScreen] = useState('results');
  const [search, setSearch] = useState(initialSearch);
  const [trips, setTrips] = useState([]);
  const [altTrips, setAltTrips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxWalk, setMaxWalk] = useState(stored.maxWalk);
  const [excluded, setExcluded] = useState(stored.excluded);
  const [alertOn, setAlertOn] = useState(stored.alertOn);
  const [openTripKey, setOpenTripKey] = useState(stored.openTripKey);
  const [mapTripKey, setMapTripKey] = useState(stored.mapTripKey);
  const [saved, setSaved] = useState(stored.saved);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);
  const scrollRef = useRef(0);
  const runId = useRef(0);

  // Lagre valg som skal huskes
  useEffect(() => { save({ maxWalk, excluded, alertOn, openTripKey, mapTripKey, saved }); }, [maxWalk, excluded, alertOn, openTripKey, mapTripKey, saved]);
  useEffect(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(null), 1800); return () => clearTimeout(t); }, [toast]);

  // Tema på hele dokumentet, så bakgrunn utenfor Root følger med
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => document.documentElement.setAttribute('data-theme', mq && mq.matches ? 'dark' : 'light');
    on(); if (mq && mq.addEventListener) mq.addEventListener('change', on);
    return () => { if (mq && mq.removeEventListener) mq.removeEventListener('change', on); };
  }, []);

  useEffect(() => {
    (async () => {
      const ok = FORCE_DEMO ? false : await entur.detect();
      setLive(ok);
      if (!ok) setSearch((s) => (s.from || s.to ? s : { ...s, ...DEMO_SEARCH }));
    })();
  }, []);

  const allModes = search.modes.length === ALL_MODES.length;

  const run = useCallback(async () => {
    if (live === null) return;
    const id = ++runId.current;
    if (!search.to || !search.from) { setTrips([]); setAltTrips(null); setError(null); return; }
    setLoading(true); setError(null);
    try {
      let list;
      if (!live) list = demoTrips();
      else list = await entur.fetchTrips({ ...search, from: search.from, to: search.to, allModes });
      if (id !== runId.current) return;
      if (live) await enrichFlights(list); // gate, status og bagasjebånd fra Avinor
      if (id !== runId.current) return;
      setTrips(list);
      // Alle forslag fjernet av ekskluderte ruter: spør Entur om alternativer uten dem
      const fr = filterTrips(list, { excluded, maxWalk });
      if (live && !fr.cand.length && excluded.length) {
        const alt = await entur.fetchTrips({ ...search, allModes, bannedLines: excluded.map((e) => e.id) });
        await enrichFlights(alt);
        if (id === runId.current) setAltTrips(alt);
      } else setAltTrips(null);
    } catch (e) {
      if (id === runId.current) {
        console.warn('Reisetavla:', e);
        const net = e instanceof TypeError || /HTTP|fetch|network/i.test(e.message || '');
        setError(net ? 'Sjekk nettforbindelsen og prøv igjen.' : /stopp i nærheten|posisjon/i.test(e.message) ? `${e.message}.` : 'Entur svarte ikke som forventet. Prøv igjen om litt.');
        setTrips([]);
      }
    } finally {
      if (id === runId.current) setLoading(false);
    }
  }, [live, search, allModes, excluded, maxWalk]);

  useEffect(() => { run(); }, [live, search, excluded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Oppdater «nå»-søk hvert 30. sekund og når appen kommer tilbake i forgrunnen
  useEffect(() => {
    if (search.when !== 'now' || screen !== 'results' || sheet) return undefined;
    const iv = setInterval(() => { if (!document.hidden) run(); }, live ? 30000 : 60000);
    const vis = () => { if (!document.hidden) run(); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', vis); };
  }, [search.when, screen, sheet, live, run]);

  const shown = useMemo(() => {
    const fr = filterTrips(trips, { excluded, maxWalk });
    if (!fr.cand.length && altTrips && altTrips.length) {
      const alt = filterTrips(altTrips, { excluded, maxWalk });
      return { ...alt, hidden: trips.length };
    }
    return fr;
  }, [trips, altTrips, excluded, maxWalk]);

  const rows = useMemo(() => exclusionRows(trips.concat(altTrips || []), excluded), [trips, altTrips, excluded]);
  const mapTrip = useMemo(() => [...trips, ...(altTrips || [])].find((t) => t.key === mapTripKey) || null, [trips, altTrips, mapTripKey]);

  const openMap = (t) => {
    scrollRef.current = window.scrollY;
    setOpenTripKey(t.key); setMapTripKey(t.key); setScreen('map');
    if (alertOn && 'Notification' in window && Notification.permission === 'default') { try { Notification.requestPermission(); } catch (e) { /* ikke støttet */ } }
  };
  const back = () => {
    setScreen('results');
    const y = scrollRef.current;
    requestAnimationFrame(() => { window.scrollTo(0, y); requestAnimationFrame(() => window.scrollTo(0, y)); });
  };

  const q = routeOnly(toParams(search, allModes));
  const isSaved = saved.some((s) => routeOnly(s.q) === q);
  const shareTrip = async (t) => {
    const url = tripLink(t, search);
    const text = `${search.from?.name || t.legs[0].from.name} → ${search.to?.name || t.legs[t.legs.length - 1].to.name}`;
    if (navigator.share) { try { await navigator.share({ title: 'Min reise', text, url }); } catch (e) { /* avbrutt */ } return; }
    try { await navigator.clipboard.writeText(url); setToast('Lenken til reisen er kopiert'); } catch (e) { setToast('Kunne ikke kopiere lenken'); }
  };
  const toggleSave = () => {
    if (isSaved) { setSaved(saved.filter((s) => routeOnly(s.q) !== q)); setToast('Fjernet fra Mine reiser'); }
    else { setSaved([{ name: `${search.from?.name || 'Min posisjon'} → ${search.to?.name || 'avganger'}`, q }, ...saved]); setToast('Lagret i Mine reiser'); }
  };

  const status = live === null ? { label: 'Kobler til' } : { live };
  const searchApi = { search, setSearch, live, demoStops: DEMO_STOPS, geocode: entur.geocode };

  return (
    <Root className="app-root">
      {screen === 'map' && mapTrip ? (
        <MapScreen trip={mapTrip} search={search} live={live} alertOn={alertOn} setAlertOn={setAlertOn} onBack={back} />
      ) : (
        <div className="app-screen">
          <main className="rt-screen app-main">
            <div className="rt-header">
              <div className="rt-wordmark">Reise<span>tavla</span></div>
              <div className="app-topr">
                <a className="app-maplink" href="kart.html" aria-label="Reisekart: kjøretøy i sanntid">
                  <svg className="rt-i" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3.5 2.5 5.5v11l4.5-2 6 2 4.5-2v-11l-4.5 2z" /><path d="M7 3.5v11M13 5.5v11" /></svg>Kart
                </a>
                <StatusBadge live={status.live} label={status.label} />
              </div>
            </div>
            {live === false && <Note>{FORCE_DEMO ? 'Viser eksempeldata (demo).' : 'Viser eksempeldata. Fikk ikke kontakt med Entur, så søk og kart bruker oppdiktede reiser.'}</Note>}
            {tab === 'reiser' && (
              <Results
                {...searchApi} allModes={allModes} loading={loading} error={error} retry={run}
                shown={shown} maxWalk={maxWalk} setMaxWalk={setMaxWalk} excluded={excluded}
                openTripKey={openTripKey} setOpenTripKey={setOpenTripKey} openMap={openMap}
                openFilter={() => setSheet('filter')} openFeedback={() => setSheet('feedback')} openShare={() => setSheet('share')}
                isSaved={isSaved} toggleSave={toggleSave} goBoard={() => setTab('avganger')} shareTrip={live ? shareTrip : null}
              />
            )}
            {tab === 'avganger' && <Board {...searchApi} allModes={allModes} />}
            {tab === 'mine' && <Saved saved={saved} setSaved={setSaved} open={(s) => { setSearch((cur) => ({ ...cur, ...fromParams(s.q) })); setTab('reiser'); }} />}
            <p className="app-credit">Rutedata: Entur AS (NLOD-lisens) · alle operatører i Norge</p>
          </main>
          <div className="app-tabbar"><TabBar active={tab} onChange={(t) => { setTab(t); window.scrollTo(0, 0); }} /></div>
        </div>
      )}
      {sheet === 'filter' && (
        <FilterSheet
          maxWalk={maxWalk} setMaxWalk={setMaxWalk} rows={rows} excluded={excluded} setExcluded={setExcluded}
          modes={search.modes} setModes={(modes) => setSearch((s) => ({ ...s, modes }))}
          count={shown.list.length} onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'feedback' && (
        <FeedbackSheet search={search} excluded={excluded} maxWalk={maxWalk} onClose={() => setSheet(null)} onSent={(msg) => { setSheet(null); setToast(msg); }} />
      )}
      {sheet === 'share' && <ShareSheet search={search} allModes={allModes} onClose={() => setSheet(null)} onToast={setToast} />}
      {toast && <Toast>{toast}</Toast>}
    </Root>
  );
}
