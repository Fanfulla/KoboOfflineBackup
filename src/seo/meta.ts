/**
 * Per-page SEO metadata, shared by the client (navigation) and the build-time
 * prerenderer (static HTML for crawlers).
 */
import { MESSAGES } from '../i18n/core.ts';
import { INDEXABLE_ROUTES, LANGS, pathFor, type Lang, type RouteId } from '../router/routes.ts';

export const SITE_URL = 'https://www.kobup.org';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const REPO_URL = 'https://github.com/Fanfulla/KoboOfflineBackup';

const OG_LOCALE: Record<Lang, string> = { en: 'en_US', it: 'it_IT' };

export interface PageMeta {
  title: string;
  description: string;
  lang: Lang;
  canonical: string | null;
  alternates: { hreflang: string; href: string }[];
  ogLocale: string;
  ogLocaleAlternates: string[];
  robots: string;
}

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;

export function pageMeta(id: RouteId | 'notFound', lang: Lang): PageMeta {
  const text = MESSAGES[lang].meta.pages[id];
  if (id === 'notFound') {
    return {
      ...text,
      lang,
      canonical: null,
      alternates: [],
      ogLocale: OG_LOCALE[lang],
      ogLocaleAlternates: [],
      robots: 'noindex',
    };
  }
  const indexable = INDEXABLE_ROUTES.includes(id);
  const alternates: PageMeta['alternates'] = LANGS.map((l) => ({
    hreflang: l,
    href: absoluteUrl(pathFor(id, l)),
  }));
  alternates.push({ hreflang: 'x-default', href: absoluteUrl(pathFor(id, 'en')) });
  return {
    ...text,
    lang,
    canonical: absoluteUrl(pathFor(id, lang)),
    alternates,
    ogLocale: OG_LOCALE[lang],
    ogLocaleAlternates: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow',
  };
}

/** schema.org JSON-LD blocks for a page. */
export function structuredData(id: RouteId | 'notFound', lang: Lang): object[] {
  if (id === 'notFound') return [];
  const m = MESSAGES[lang];
  const url = absoluteUrl(pathFor(id, lang));
  const home = absoluteUrl(pathFor('home', lang));
  const blocks: object[] = [];

  if (id === 'home') {
    blocks.push(
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'KoBup',
        alternateName: 'Kobo Backup Manager',
        url,
        inLanguage: lang,
        description: m.meta.pages.home.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Windows, macOS, Linux, ChromeOS',
        browserRequirements:
          'Requires a modern desktop browser. Restore requires Chrome, Edge, Opera or Brave.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        featureList: m.home.features.map((f) => f.title),
        screenshot: OG_IMAGE,
        softwareVersion: __APP_VERSION__,
        license: 'https://opensource.org/licenses/MIT',
        isAccessibleForFree: true,
        creator: { '@type': 'Person', name: 'Fanfulla' },
        sameAs: [REPO_URL],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'KoBup',
        url: home,
        inLanguage: lang,
      },
    );
  } else {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'KoBup', item: home },
        { '@type': 'ListItem', position: 2, name: m.nav[id], item: url },
      ],
    });
  }

  if (id === 'faq') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: m.faq.categories.flatMap((c) =>
        c.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      ),
    });
  }

  if (id === 'guide') {
    for (const section of m.guide.sections) {
      blocks.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: section.title,
        inLanguage: lang,
        url: `${url}#${section.id}`,
        totalTime: 'PT10M',
        tool: [{ '@type': 'HowToTool', name: 'USB cable' }],
        step: section.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
      });
    }
  }

  return blocks;
}
