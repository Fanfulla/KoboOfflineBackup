/**
 * Server entry used at build time (scripts/postbuild.ts) to prerender every
 * route into static HTML for search engines, social previews and fast first paint.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.tsx';
import { renderHead } from './seo/head.ts';
import { INDEXABLE_ROUTES, LANGS, ROUTE_IDS, pathFor, resolvePath } from './router/routes.ts';
import { absoluteUrl } from './seo/meta.ts';

export function render(path: string) {
  const route = resolvePath(path);
  return {
    lang: route.lang,
    head: renderHead(route.id, route.lang),
    html: renderToString(
      <StrictMode>
        <App path={path} />
      </StrictMode>,
    ),
  };
}

/** Every page to prerender: [url path, output file relative to dist]. */
export function pages(): [string, string][] {
  const out: [string, string][] = [];
  for (const id of ROUTE_IDS) {
    for (const lang of LANGS) {
      const path = pathFor(id, lang);
      // "/it" → it.html (served at /it by Vercel cleanUrls and vite preview alike)
      out.push([path, path === '/' ? 'index.html' : `${path.slice(1)}.html`]);
    }
  }
  out.push(['/404', '404.html']);
  return out;
}

/** sitemap.xml with hreflang alternates for every indexable page. */
export function sitemap(lastmod: string): string {
  const urls = INDEXABLE_ROUTES.flatMap((id) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map(
          (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(pathFor(id, l))}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(pathFor(id, 'en'))}"/>`,
      ].join('\n');
      const priority = id === 'home' ? '1.0' : ['backup', 'restore'].includes(id) ? '0.9' : '0.7';
      return `  <url>\n    <loc>${absoluteUrl(pathFor(id, lang))}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n${alternates}\n  </url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}
