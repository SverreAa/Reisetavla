// Bygger reisetavla-ds (ESM + .d.ts + CSS) fra designsystemets kildefiler i ../project.
// Kjør: node design-system/package/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const proj = join(here, '..', 'project');
const dist = join(here, 'dist');
mkdirSync(dist, { recursive: true });

// 1. JS: bundle.js (klassisk skript) -> ESM med React fra 'react'
let js = readFileSync(join(proj, 'components', 'bundle.js'), 'utf8');
js = js.replace(/^\/\* @ds-bundle:.*\*\/\r?\n/, '');
js = js.replace("(function () {\n  var React = window.React;", "import React from 'react';\n");
const exp = js.indexOf('  window.Reisetavla = Object.assign(window.Reisetavla || {}, {');
if (exp < 0) throw new Error('fant ikke eksportblokken i bundle.js');
const body = js.slice(exp).match(/\|\| \{\}, \{([\s\S]*?)\}\);\s*\}\)\(\);/)[1];
const names = body.split(',').map(s => s.split(':')[0].trim()).filter(n => n && n !== 'MODE_LABEL');
js = js.slice(0, exp) + `export { ${names.join(', ')}, MODE_LABEL };\n`;
writeFileSync(join(dist, 'index.js'), js);

// 2. Typer: index.d.ts uten global window-deklarasjon
let dts = readFileSync(join(proj, 'components', 'index.d.ts'), 'utf8');
dts = dts.replace(/\ndeclare global[^\n]*\n?/, '\n');
dts += "export declare const MODE_LABEL: Record<Mode, string>;\n";
writeFileSync(join(dist, 'index.d.ts'), dts);

// 3. CSS: tokens.json -> custom properties (lyst på :root, mørkt via media + data-theme), så komponentstilene
const t = JSON.parse(readFileSync(join(proj, 'tokens.json'), 'utf8'));
const light = [], dark = [], root = [];
const val = (v, th) => (typeof v === 'string' ? v : v[th] ?? v.light);
for (const c of t.color.tokens) { light.push(`--${c.name}:${val(c.value, 'light')}`); if (typeof c.value !== 'string' && c.value.dark) dark.push(`--${c.name}:${c.value.dark}`); }
for (const s of t.shadow.tokens) { light.push(`--${s.name}:${val(s.value, 'light')}`); if (typeof s.value !== 'string' && s.value.dark) dark.push(`--${s.name}:${s.value.dark}`); }
for (const fam of ['spacing', 'radius', 'size']) for (const x of t[fam].tokens) root.push(`--${x.name}:${x.value}`);
for (const [k, v] of Object.entries(t.type.families)) root.push(`--font-${k}:${v}`);
const comp = readFileSync(join(proj, 'components', 'bundle.css'), 'utf8');
const imports = comp.match(/^@import[^\n]*\n/gm) || [];
const rest = comp.replace(/^@import[^\n]*\n/gm, '');
const css = `${imports.join('')}/* Reisetavla tokens — generert fra tokens.json */
:root{${light.join(';')};${root.join(';')}}
/* Mørkt tema: Root setter alltid data-theme (systemvalg leses i JS), så ingen media query trengs. */
[data-theme="dark"]{${dark.join(';')};color-scheme:dark}
[data-theme="light"]{${light.join(';')};color-scheme:light}
${rest}`;
writeFileSync(join(dist, 'styles.css'), css);
// 4. Dokumentasjon: komponent-README -> docs/components/<Name>.md (gruppe fra preview-markøren), designboken -> docs/guides/
const docsC = join(here, 'docs', 'components'), docsG = join(here, 'docs', 'guides');
mkdirSync(docsC, { recursive: true }); mkdirSync(docsG, { recursive: true });
for (const n of names) {
  let md = readFileSync(join(proj, 'components', n, 'README.md'), 'utf8');
  const first = readFileSync(join(proj, 'components', n, 'preview.html'), 'utf8').split('\n')[0];
  const group = (first.match(/group="([^"]+)"/) || [])[1] || 'Komponenter';
  md = md.replace(/^# .*\n+/, '');
  writeFileSync(join(docsC, `${n}.md`), `---\ncategory: ${group}\n---\n\n${md}`);
}
writeFileSync(join(docsG, 'reisetavla.md'), '# Reisetavla Mobile\n\n' + readFileSync(join(proj, 'README.md'), 'utf8'));
console.log(`reisetavla-ds: ${names.length} eksporter, ${light.length + root.length} tokens`);
