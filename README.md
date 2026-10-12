# Reisetavla

Reiseplanlegger for mobil med sanntidsdata fra Entur, bygget på designsystemet **Reisetavla Mobile** (`reisetavla-ds`).

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
- `legacy/index.html` – første versjon av appen.

## Datakilder

Entur reiseplanlegger, geokoder og kjøretøyposisjoner (NLOD). Kart: © OpenStreetMap-bidragsytere.
Billettkontroll og flyinfo (gate, seter, bagasjebånd) har ingen kilde ennå og vises bare i demo.
Tilbakemeldinger lagres på enheten til `FEEDBACK_URL` i `app/src/sheets/FeedbackSheet.jsx` er satt.
