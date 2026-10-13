import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { LinePill, WalkChip, Switch, StatusBadge, WarningLine, Button, Icon } from 'reisetavla-ds';
import * as entur from '../lib/entur.js';
import { demoRoute, demoVehicles } from '../lib/demo.js';
import { hm, durText, MODE_NAME, MODE_ALL, lower, platformLabel } from '../lib/format.js';
import { journeyState, legPoints, classifyVehicles } from '../lib/progress.js';
import { splitAt } from '../lib/geo.js';
import { makeObstacles, placeAll, labelWidth } from '../lib/labels.js';
import { CONTROL_MAX_AGE } from '../lib/view.js';

const FADED = 0.28;
const CROWD = [null, 'God plass', 'Noe trangt', 'Trangt'];
const controlAge = (c) => Math.max(0, Math.round((Date.now() - new Date(c.reportedAt).getTime()) / 60000));

function cssVar(el, name) { return getComputedStyle(el).getPropertyValue(name).trim() || '#5a6779'; }

export default function MapScreen({ trip, search, live, alertOn, setAlertOn, onBack }) {
  const wrapRef = useRef(null), mapEl = useRef(null), topRef = useRef(null), sheetRef = useRef(null);
  const mapRef = useRef(null), layerRef = useRef(null);
  const [view, setView] = useState(0);
  const [moving, setMoving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [routeLeg, setRouteLeg] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeErr, setRouteErr] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const vehMemo = useRef({});
  const [demoStep, setDemoStep] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const [gps, setGps] = useState(null);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme'));
  const [tiles, setTiles] = useState('kv');
  const demo = live === false;

  // Klokke og tema
  useEffect(() => { const iv = setInterval(() => setClock(Date.now()), 15000); return () => clearInterval(iv); }, []);
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(document.documentElement.getAttribute('data-theme')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  // GPS bare når tilgangen allerede er gitt (ingen ny forespørsel fra kartet)
  useEffect(() => {
    if (demo || !navigator.geolocation || !navigator.permissions) return undefined;
    let id = null, alive = true;
    navigator.permissions.query({ name: 'geolocation' }).then((p) => {
      if (!alive || p.state !== 'granted') return;
      id = navigator.geolocation.watchPosition((pos) => setGps([pos.coords.latitude, pos.coords.longitude]), () => {}, { enableHighAccuracy: true, maximumAge: 10000 });
    }).catch(() => {});
    return () => { alive = false; if (id != null) navigator.geolocation.clearWatch(id); };
  }, [demo]);

  const js = useMemo(() => journeyState(trip, { stepIndex: demo ? demoStep : undefined, alertOn, gps, demo, now: clock }), [trip, demoStep, alertOn, gps, demo, clock]);

  // Avstigningsvarsel: vibrasjon, og systemvarsel når appen er i bakgrunnen
  const lastAlert = useRef('');
  useEffect(() => {
    const sig = js && js.alertTitle ? js.alertTitle + js.alertText : '';
    if (sig && sig !== lastAlert.current) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        try { new Notification(js.alertTitle, { body: js.alertText, tag: 'reisetavla-avstigning' }); } catch (e) { /* ikke støttet */ }
      }
    }
    lastAlert.current = sig;
  }, [js]);

  // Kartet
  useEffect(() => {
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false, zoomSnap: 0.25 });
    // Kartverket: åpne kartfliser for Norge (gråtone). Leverer de ikke, brukes OpenStreetMap som reserve.
    const kv = L.tileLayer('https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png', { maxZoom: 18 });
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
    let kvErr = 0, kvOk = 0, usingOsm = false;
    kv.on('tileerror', () => { if (++kvErr >= 4 && kvOk === 0 && !usingOsm) { usingOsm = true; map.removeLayer(kv); osm.addTo(map); setTiles('osm'); } });
    kv.on('tileload', () => { kvOk++; });
    kv.addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    let raf = 0;
    const bump = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setView((v) => v + 1)); };
    map.on('move zoom resize', bump);
    map.on('movestart zoomstart', () => setMoving(true));
    map.on('moveend zoomend', () => { setMoving(false); bump(); });
    // Start på den delen av reisen som gjelder nå: nåværende etappe og de to neste (uten fly)
    const from = js ? js.s.li : 0;
    let pts = trip.legs.slice(from, from + 3).filter((l) => l.mode !== 'air').flatMap((l) => l.polyline);
    if (!pts.length) pts = trip.legs.filter((l) => l.mode !== 'air').flatMap((l) => l.polyline);
    const top = (topRef.current?.offsetHeight || 120) + 16, bottom = (sheetRef.current?.offsetHeight || 300) + 16;
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [70, top + 50], paddingBottomRight: [70, bottom + 50], maxZoom: 16 });
    else map.setView([59.91, 10.75], 13);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapEl.current);
    return () => { ro.disconnect(); map.remove(); mapRef.current = null; };
  }, [trip]);

  // Valgt rute: trasé og kjøretøy
  useEffect(() => {
    setRoute(null); setVehicles(null); setRouteErr(null); vehMemo.current = {};
    if (!routeLeg) return undefined;
    let alive = true, iv = null;
    (async () => {
      try {
        const r = demo ? demoRoute(routeLeg) : await entur.fetchRoute(routeLeg);
        if (!alive) return; setRoute(r);
        const poll = async () => {
          try {
            const raw = demo ? demoVehicles(r) : await entur.fetchVehicles(r.lineId);
            if (!alive) return;
            const c = classifyVehicles(r, raw, vehMemo.current); vehMemo.current = c.memo; setVehicles(c);
          } catch (e) { if (alive) setVehicles({ list: [], groups: [], error: true }); }
        };
        await poll();
        iv = setInterval(() => { if (!document.hidden) poll(); }, demo ? 1000 : 8000);
      } catch (e) { if (alive) setRouteErr('Fant ikke ruta i sanntid nå.'); }
    })();
    return () => { alive = false; if (iv) clearInterval(iv); };
  }, [routeLeg, demo]);

  // Tegn linjer og stopp i kartet
  useEffect(() => {
    const map = mapRef.current, group = layerRef.current, root = wrapRef.current;
    if (!map || !group || !root || !js) return;
    group.clearLayers();
    const col = (l) => (l.mode === 'foot' ? cssVar(root, '--muted') : (l.colour || cssVar(root, `--m-${l.mode}`)));
    const surface = cssVar(root, '--surface');
    if (route) {
      const c = route.colour || cssVar(root, `--m-${route.mode}`);
      L.polyline(route.polyline, { color: c, weight: 12, opacity: 0.2, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(group);
      route.stops.forEach((s) => L.circleMarker([s.lat, s.lon], { radius: 3, color: c, weight: 2, opacity: 0.7, fillColor: surface, fillOpacity: 1, interactive: false }).addTo(group));
    }
    const { s } = js;
    trip.legs.forEach((l, li) => {
      const c = col(l);
      const style = { color: c, weight: l.mode === 'foot' ? 4 : l.mode === 'air' ? 3 : 6, dashArray: l.mode === 'foot' ? '1 8' : l.mode === 'air' ? '8 8' : null, lineCap: 'round', lineJoin: 'round', interactive: false };
      if (li < s.li) L.polyline(l.polyline, { ...style, opacity: FADED }).addTo(group);
      else if (li > s.li) L.polyline(l.polyline, { ...style, opacity: 1 }).addTo(group);
      else {
        const [a, b] = splitAt(l.polyline, js.me);
        if (a.length > 1) L.polyline(a, { ...style, opacity: FADED }).addTo(group);
        if (b.length > 1) L.polyline(b, { ...style, opacity: 1 }).addTo(group);
      }
      if (l.mode === 'foot') return;
      const pts = legPoints(l), last = pts.length - 1;
      pts.forEach((p, k) => {
        const big = k === 0 || k === last;
        const op = js.passed(li, k) && !(k === s.i && li === s.li) ? 0.4 : 1;
        L.circleMarker([p.lat, p.lon], { radius: big ? 6 : 3.5, color: c, weight: big ? 3 : 2, opacity: op, fillColor: surface, fillOpacity: op, interactive: false }).addTo(group);
      });
    });
  }, [js, route, trip, theme]);

  // Overlegg i skjermkoordinater: merkelapper, billettkontroll, kjøretøy, posisjon
  const overlay = useMemo(() => {
    const map = mapRef.current, wrap = wrapRef.current;
    if (!map || !wrap || !js) return null;
    const W = wrap.clientWidth;
    const topB = (topRef.current?.offsetTop || 0) + (topRef.current?.offsetHeight || 0) + 6;
    const botB = (sheetRef.current?.offsetTop || wrap.clientHeight) - 6;
    const bound = { l: 6, r: W - 6, t: topB, b: botB };
    const P = (lat, lon) => map.latLngToContainerPoint([lat, lon]);
    const visible = (pt) => pt.x >= 0 && pt.x <= W && pt.y >= topB - 20 && pt.y <= botB + 20;
    const { s } = js;
    let labels = [];
    trip.legs.forEach((l, li) => {
      if (l.mode === 'foot') return;
      const pts = legPoints(l), last = pts.length - 1;
      const done = js.legDone(li);
      const f = l.flight;
      const name = `${MODE_NAME[l.mode]} ${l.code}`;
      labels.push({ li, lat: pts[0].lat, lon: pts[0].lon, c: l.colour || `var(--m-${l.mode})`, op: done ? 0.55 : 1, kind: `På · ${name}`, name: pts[0].name, meta: `${hm(l.start)}${f && f.gate ? ` · Gate ${f.gate}` : l.from.platform ? ` · ${platformLabel(l.mode, l.from.platform)}` : ''}` });
      labels.push({ li, lat: pts[last].lat, lon: pts[last].lon, c: l.colour || `var(--m-${l.mode})`, op: done ? 0.55 : 1, kind: `Av · ${name}`, name: pts[last].name, meta: `${hm(l.end)}${f && f.belt ? ` · bånd ${f.belt}` : ''}` });
    });
    for (let i = labels.length - 1; i > 0; i--) {
      const a = labels[i - 1], b = labels[i];
      if (a.kind.startsWith('Av') && b.kind.startsWith('På') && a.name === b.name) {
        a.kind = 'Bytte · ' + b.kind.replace('På · ', ''); const gate = (b.meta.match(/ · Gate .+$/) || [""])[0]; a.meta = `${a.meta.split(' · ')[0]} → ${b.meta.split(' · ')[0]}${gate}`; a.c = b.c; a.op = b.op;
        labels.splice(i, 1);
      }
    }
    const meP = P(js.me[0], js.me[1]);
    const lines = trip.legs.filter((l) => l.mode !== 'air').map((l) => l.polyline.map(([la, lo]) => P(la, lo)));
    const obstacles = makeObstacles(lines, meP);
    labels = labels.map((lb) => { const pt = P(lb.lat, lb.lon); return { ...lb, x: pt.x, y: pt.y, w: labelWidth(lb.kind, lb.name, lb.meta), h: 54 }; }).filter((lb) => visible(lb));
    const controls = trip.legs.filter((l) => l.control && controlAge(l.control) <= CONTROL_MAX_AGE).map((l) => {
      const st = l.stops.find((x) => x.name === l.control.at); if (!st) return null;
      const pt = P(st.lat, st.lon); return { x: pt.x, y: pt.y, w: 28, h: 28, control: true, force: true };
    }).filter(Boolean).filter(visible);
    // Prioritet: billettkontroll, så etappene foran deg (nærmest først), så tilbakelagte
    const rank = (lb) => (lb.li >= s.li ? lb.li - s.li : 100 + (s.li - lb.li));
    labels.sort((a, b) => rank(a) - rank(b));
    const ahead = labels.filter((lb) => rank(lb) < 100), behind = labels.filter((lb) => rank(lb) >= 100);
    const placed = placeAll([...ahead, ...controls, ...behind], obstacles, bound);
    const veh = vehicles && route ? vehicles.list.map((v) => ({ ...v, pt: P(v.lat, v.lon) })) : [];
    return { controls: placed.filter((x) => x.control && !x.hidden), labels: placed.filter((x) => !x.control && !x.hidden), me: meP, veh, s };
  }, [js, trip, vehicles, route, view, sheetOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => { setView((v) => v + 1); }, [sheetOpen]);

  const chips = trip.legs.filter((l) => l.lineId && l.mode !== 'air' && l.mode !== 'foot' && (demo || l.serviceJourneyId));
  const ctrlLeg = trip.legs.find((l) => l.control && controlAge(l.control) <= CONTROL_MAX_AGE);
  const routeTitle = route ? `${MODE_NAME[route.mode]} ${route.code} i trafikk nå` : '';
  const title = `${search.from?.name || trip.legs[0].from.name} → ${(search.to?.name || trip.legs[trip.legs.length - 1].to.name).split(',')[0]}`;
  const vehBg = route ? (route.colour || `var(--m-${route.mode})`) : '';

  return (
    <div ref={wrapRef} className={`map-screen${moving ? ' is-moving' : ''}`}>
      <div ref={mapEl} className="map-canvas" aria-label="Kart over reisen" />
      {overlay && (
        <div className="map-overlay" aria-hidden="false">
          {overlay.controls.map((c, i) => (
            <div key={'c' + i} className="map-control" style={{ left: c.bx, top: c.by }} role="img" aria-label="Billettkontroll meldt" title="Billettkontroll meldt"><Icon name="warn" /></div>
          ))}
          {overlay.labels.map((l, i) => (
            <div key={'l' + i} className="map-label" style={{ left: l.bx, top: l.by, width: l.w, opacity: l.op }}>
              <div className="k"><i style={{ background: l.c }} />{l.kind}</div>
              <div className="n">{l.name}</div>
              <div className="m">{l.meta}</div>
            </div>
          ))}
          {overlay.veh.map((v) => (
            <div key={v.id} className={`map-vehicle${v.toward ? ' toward' : ''}`} style={{ left: v.pt.x, top: v.pt.y, background: vehBg }} title={`${v.where} · ${v.status}`}>{route.code}</div>
          ))}
          <div className="map-me" style={{ left: overlay.me.x, top: overlay.me.y }} role="img" aria-label="Din posisjon" />
        </div>
      )}

      <div ref={topRef} className="map-top">
        <div className="map-top-row">
          <button type="button" className="map-back" onClick={onBack}><span aria-hidden="true">‹</span>Tilbake</button>
          <span className="map-title">{title}</span>
        </div>
        {chips.length > 0 && (
          <div className="map-chips">
            {chips.map((l, i) => {
              const on = routeLeg && routeLeg.lineId === l.lineId;
              return (
                <button key={l.lineId + i} type="button" className={`map-chip${on ? ' on' : ''}`} aria-pressed={String(!!on)} onClick={() => { setRouteLeg(on ? null : l); setSheetOpen(true); }}>
                  <LinePill mode={l.mode} code={l.code} colour={l.colour || undefined} textColour={l.textColour || undefined} />{on ? 'Vises' : MODE_ALL[l.mode]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <section ref={sheetRef} className="map-sheet" aria-label="Reisedetaljer">
        <button type="button" className="map-grip" aria-expanded={String(sheetOpen)} onClick={() => setSheetOpen(!sheetOpen)}>
          <span className="h" /><span className="t">{sheetOpen ? 'Skjul detaljer' : 'Vis detaljer'}</span>
        </button>
        {js && js.alertTitle && (
          <div className="map-alert" role="alert"><b>{js.alertTitle}</b><span>{js.alertText}</span></div>
        )}
        <div className="map-summary">
          <div className="row"><b>{hm(trip.start)} – {hm(trip.end)}</b><span>{durText(trip.minutes)}</span></div>
          {js && <span className="status">{js.status}</span>}
        </div>
        {sheetOpen && (
          <div className="map-sheet-body">
            {routeLeg && (
              <div className="map-route">
                <div className="head"><b>{routeTitle || `${MODE_NAME[routeLeg.mode]} ${routeLeg.code}`}</b><StatusBadge live label="Sanntid" /></div>
                {routeErr && <span className="app-small">{routeErr}</span>}
                {route && <span className="app-small">Ring rundt: på vei mot deg. Blek: på vei fra deg.</span>}
                {vehicles && vehicles.error && <span className="app-small">Fikk ikke hentet kjøretøy akkurat nå. Prøver igjen.</span>}
                {vehicles && !vehicles.error && !vehicles.list.length && <span className="app-small">Fant ingen kjøretøy med posisjon på linjen nå. Ikke alle operatører deler kjøretøyposisjoner.</span>}
                {vehicles && vehicles.groups.map((g) => (
                  <div key={g.title} className="group">
                    <div className="gh"><span>{g.title}</span><span>{g.note}</span></div>
                    {g.rows.map((v) => (
                      <div key={v.id} className="vr"><span>{v.where}</span><b className={v.toward ? '' : 'away'}>{v.status}</b></div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div className="app-switch-row">
              <div className="grow"><b>Varsle én stasjon før jeg skal av</b><div className="app-small">Vibrerer og viser et varsel</div></div>
              <Switch checked={alertOn} label="Varsle før avstigning" onChange={(v) => {
                setAlertOn(v);
                if (v && 'Notification' in window && Notification.permission === 'default') { try { Notification.requestPermission(); } catch (e) { /* ikke støttet */ } }
              }} />
            </div>
            {demo && js && (
              <div className="map-demo">
                <Button variant="ghost" onClick={() => setDemoStep(Math.min(js.si + 1, js.steps.length - 1))}>Neste stopp (demo)</Button>
                <Button variant="ghost" onClick={() => setDemoStep(0)}>Start på nytt</Button>
              </div>
            )}
            {ctrlLeg && <WarningLine>{`Billettkontroll meldt ved ${ctrlLeg.control.at} på ${lower(MODE_NAME[ctrlLeg.mode])} ${ctrlLeg.code} for ${controlAge(ctrlLeg.control)} min siden`}</WarningLine>}
            <ol className="map-legs">
              {trip.legs.map((l, li) => {
                const done = js ? js.legDone(li) : false;
                const meta = `${hm(l.start)}–${hm(l.end)}${l.crowd ? ' · ' + CROWD[l.crowd] : ''}${l.flight && l.flight.seats != null ? ` · ${l.flight.seats} ledige seter` : ''}${done ? ' · tilbakelagt' : ''}`;
                return (
                  <li key={li} className={done ? 'done' : ''}>
                    {l.mode === 'foot' ? <WalkChip minutes={l.minutes} /> : <LinePill mode={l.mode} code={l.code} colour={l.colour || undefined} textColour={l.textColour || undefined} />}
                    <div className="grow">
                      <div className="strong">{l.mode === 'foot' ? `Gå ${l.meters} m til ${l.to.name}` : `${l.from.name} → ${l.to.name}`}</div>
                      <div className="app-small tabular">{meta}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="map-credit">Kart: {tiles === 'kv' ? '© Kartverket' : '© OpenStreetMap-bidragsytere'} · Rutedata: Entur AS</p>
          </div>
        )}
      </section>
    </div>
  );
}
