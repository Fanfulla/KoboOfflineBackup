/**
 * Runs after `vite build`:
 *  1. SSR-builds src/entry-server.tsx and prerenders every route (EN + IT)
 *     into static HTML with per-page <head> (SEO, social previews, fast LCP)
 *  2. writes sitemap.xml
 *  3. builds the service worker with the list of files to precache (offline)
 *
 *   node scripts/postbuild.ts
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const ssrOut = join(root, 'node_modules', '.cache', 'kobup-ssr');

// 1. Server bundle -----------------------------------------------------------
await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: ssrOut,
    emptyOutDir: true,
    copyPublicDir: false,
    minify: false,
  },
});
interface ServerEntry {
  render(path: string): { html: string; head: string; lang: string };
  pages(): [path: string, file: string][];
  sitemap(lastmod: string): string;
}
const server = (await import(pathToFileURL(join(ssrOut, 'entry-server.js')).href)) as ServerEntry;

// 2. Prerender ---------------------------------------------------------------
const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-->') || !template.includes('<!--head-->')) {
  throw new Error('dist/index.html is missing the <!--head--> / <!--app--> placeholders');
}

for (const [path, file] of server.pages()) {
  const { html, head, lang } = server.render(path);
  const page = template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace(/<!--head-->[\s\S]*?<!--\/head-->/, head)
    .replace('<div id="root"><!--app--></div>', `<div id="root" data-path="${path}">${html}</div>`);
  const target = join(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, page);
}
console.log(`Prerendered ${server.pages().length} pages`);

writeFileSync(join(dist, 'sitemap.xml'), server.sitemap(new Date().toISOString().split('T')[0]!));
rmSync(ssrOut, { recursive: true, force: true });

// 3. Service worker ----------------------------------------------------------
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const SKIP = /(^|\/)(sw\.js|404\.html|sitemap\.xml|robots\.txt|og-image\.(png|svg))$|\.(woff|map)$/;
const files = walk(dist)
  .map((full) => relative(dist, full).split(sep).join('/'))
  .filter((file) => !SKIP.test(file))
  .sort();

/** Pages are cached under their clean URL (what the browser navigates to). */
const toUrl = (file: string) =>
  file === 'index.html' ? '/' : `/${file.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
const precache = files.map(toUrl);

const version = createHash('sha256');
for (const file of files) version.update(file).update(readFileSync(join(dist, file)));

await build({
  root,
  configFile: false,
  logLevel: 'warn',
  define: {
    __PRECACHE__: JSON.stringify(precache),
    __SW_VERSION__: JSON.stringify(version.digest('hex').slice(0, 12)),
  },
  build: {
    outDir: dist,
    emptyOutDir: false,
    copyPublicDir: false,
    target: 'es2022',
    lib: { entry: 'src/sw/sw.ts', formats: ['iife'], name: 'kobupServiceWorker', fileName: () => 'sw.js' },
  },
});
console.log(`Service worker: ${precache.length} files precached`);
