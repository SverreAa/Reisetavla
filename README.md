# Reisetavla

Reiseplanlegger for mobil med sanntidsdata fra Entur, bygget på designsystemet **Reisetavla Mobile** (`reisetavla-ds`).

## Publisering

Appen publiseres med GitHub Pages fra `main`: https://sverreaa.github.io/Reisetavla/. Alt som pushes til `main`, går live etter et minutt eller to.
Før publisering: bygg appen (`node app/build.mjs`) og commit `app/dist/`. Endres ikoner eller manifest, øk `VERSION` i `sw.js`.

Backup av live-versjonen før den nye appen: grenen `backup/live-2026-10-12` og taggen `live-backup-2026-10-12` (kopi av forsiden også i `legacy/index-live-2026-10-12.html`).

## Kjøre lokalt

```
node design-system/package/build.mjs   # bygg designsystemet (etter endringer i design-system/project)
node app/build.mjs                     # bygg appen til app/dist
node app/serve.mjs                     # http://localhost:5173/  (legg til ?demo for eksempeldata)
```

Første gang: `npm install` i `app/` og i `design-system/package/`.

## Mapper

- `app/` – appen (React + Leaflet). `src/screens` (reiser, kart, avganger, Mine reiser), `src/sheets` (reisevalg, tilbakemelding, deling), `src/lib` (Entur, demo-data, filtrering, posisjon på reisen, merkelapper).
- `design-system/project/` – designsystemets kilde (tokens, komponenter, designbok). Speiles til Design System-artifacten på claude.ai.
- `design-system/package/` – bygger `reisetavla-ds` fra kilden.
- `.design-sync/` – oppsett for `/design-sync` til Claude Design.
- `templates/reise-prototype/` – designoverleveringen for reiseforslag og kart.
- `kart.html` – Reisekart: alle kjøretøy i sanntid (GPS fra Entur og beregnede posisjoner der operatøren ikke sender GPS, f.eks. Ruter), avvik og delte reiser (`kart.html?r=…`).
- `sw.js`, `manifest.webmanifest`, `icons/` – PWA: appen kan legges på Hjem-skjermen og åpner uten nett; rutedata hentes alltid ferskt.
- `legacy/` – tidligere versjoner av forsiden.

## Datakilder

Entur reiseplanlegger, geokoder og kjøretøyposisjoner (NLOD). Kart: © Kartverket, med OpenStreetMap som reserve.
Billettkontroll og flyinfo (gate, seter, bagasjebånd) har ingen kilde ennå og vises bare i demo.
Tilbakemeldinger lagres på enheten til `FEEDBACK_URL` i `app/src/sheets/FeedbackSheet.jsx` er satt.
