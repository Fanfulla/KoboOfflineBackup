/**
 * Static <head> markup for a page (used by the build-time prerenderer).
 * Attribute names mirror what useDocumentMeta updates on the client.
 */
import { OG_IMAGE, pageMeta, structuredData } from './meta.ts';
import type { Lang, RouteId } from '../router/routes.ts';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** JSON safe to inline in <script>: no "</script>" or HTML comment breakouts. */
const inlineJson = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

export function renderHead(id: RouteId | 'notFound', lang: Lang): string {
  const m = pageMeta(id, lang);
  const meta = (attr: 'name' | 'property', key: string, content: string) =>
    `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;

  const tags = [
    `<title>${escapeHtml(m.title)}</title>`,
    meta('name', 'description', m.description),
    meta('name', 'robots', m.robots),
    ...(m.canonical ? [`<link rel="canonical" href="${m.canonical}" />`] : []),
    ...m.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'KoBup'),
    meta('property', 'og:title', m.title),
    meta('property', 'og:description', m.description),
    ...(m.canonical ? [meta('property', 'og:url', m.canonical)] : []),
    meta('property', 'og:locale', m.ogLocale),
    ...m.ogLocaleAlternates.map((l) => meta('property', 'og:locale:alternate', l)),
    meta('property', 'og:image', OG_IMAGE),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', m.title),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', m.title),
    meta('name', 'twitter:description', m.description),
    meta('name', 'twitter:image', OG_IMAGE),
    ...structuredData(id, lang).map(
      (block) => `<script type="application/ld+json" data-seo="ld">${inlineJson(block)}</script>`,
    ),
  ];
  return tags.join('\n    ');
}
