// Bygger appen til app/dist (app.js + app.css). Kjør: node app/build.mjs [--watch]
// reisetavla-ds hentes fra design-system/package/dist; React løses alltid fra appens egen node_modules
// så biblioteket og appen deler én React-instans.
import * as esbuild from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, 'package.json'));

const dedupe = {
  name: 'dedupe',
  setup(b) {
    b.onResolve({ filter: /^reisetavla-ds$/ }, () => ({ path: join(here, '..', 'design-system', 'package', 'dist', 'index.js') }));
    b.onResolve({ filter: /^reisetavla-ds\/styles\.css$/ }, () => ({ path: join(here, '..', 'design-system', 'package', 'dist', 'styles.css') }));
    b.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (a) => ({ path: require.resolve(a.path) }));
  },
};

const opts = {
  entryPoints: { app: join(here, 'src', 'main.jsx') },
  outdir: join(here, 'dist'),
  bundle: true,
  format: 'iife',
  jsx: 'automatic',
  minify: !process.argv.includes('--watch'),
  sourcemap: process.argv.includes('--watch') ? 'inline' : false,
  target: ['es2019', 'safari14'],
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.png': 'dataurl', '.svg': 'dataurl' },
  plugins: [dedupe],
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
} else {
  await esbuild.build(opts);
}
