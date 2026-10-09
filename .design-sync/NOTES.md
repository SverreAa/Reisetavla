# design-sync notes — Reisetavla Mobile

## Repo layout
- The design system's source of truth is `design-system/project/` (tokens.json, components/bundle.js, bundle.css, index.d.ts, component README.md files). That is also the claude.ai Design System artifact's content (https://claude.ai/artifact/SFWx9wxNdXafKTCvYXGYSU).
- `design-system/package/build.mjs` (cfg.buildCmd) turns it into the npm-shaped package `reisetavla-ds`: dist/index.js (ESM, converted from the IIFE bundle.js by string replacement — keep the `(function () {\n  var React = window.React;` opener and the `Object.assign(window.Reisetavla || {}, {` export block intact), dist/index.d.ts, dist/styles.css (tokens.json -> CSS vars + bundle.css), docs/components/<Name>.md (category from preview.html marker group) and docs/guides/reisetavla.md.
- Adding a component: add it to bundle.js (function + header + export block), index.d.ts, and create components/<Name>/README.md + preview.html (build.mjs reads both for every export), then author `.design-sync/previews/<Name>.tsx`.
- Run: `node design-system/package/build.mjs`, then `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules design-system/package/node_modules --out ./ds-bundle`.

## Gotchas fixed this run
- Button reset must stay `:where(.rt-root) button{…}` (zero specificity) — `.rt-root button` beat `.rt-btn` and stripped button backgrounds.
- `Root` sets `data-theme` on a div, so the dark tokens are also declared on `[data-theme="dark"]` (not only `:root[...]`), plus a `[data-theme="light"]` block.
- `cfg.provider = Root` wraps every preview; designs must wrap in Root too (conventions.md says so).
- Windows/PowerShell: run `npm.cmd`/`npx.cmd` (npm.ps1 is blocked by execution policy). esbuild's postinstall is blocked by npm's install-scripts gate but the platform binary works anyway.
- Git lives at `C:\Program Files\Git\cmd` (installed during the first sync; sessions started earlier don't have it on PATH). Repo-local user.name/email are set.

## Known render warns
- none outstanding. 13 components use `cardMode: "column"` (GRID_OVERFLOW remedy); BottomSheet uses `cardMode: "single"`.

## Re-sync risks
- `design-system/project/` and the package can drift if someone edits the artifact on claude.ai and not the local files (or vice versa): re-read the artifact's files before a re-sync.
- build.mjs's IIFE->ESM conversion is string-based; reformatting bundle.js can break it (it throws "fant ikke eksportblokken").
- Fonts are Google Fonts via `@import` in bundle.css ([FONT_REMOTE]); designs need network access to fonts.googleapis.com.
- Group folder for «Søk» is slugged to `components/s-k/`; renaming groups regroups paths (old paths land in deletePaths).
- Toolchain at first sync: node v24.20.0, esbuild 0.28.2, playwright chromium-1248.
