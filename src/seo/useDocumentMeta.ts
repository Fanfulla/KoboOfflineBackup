import { useEffect } from 'react';
import { OG_IMAGE, pageMeta, structuredData } from './meta.ts';
import type { ResolvedRoute } from '../router/routes.ts';

function upsert(selector: string, create: () => HTMLElement, apply: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  apply(el);
}

const meta = (attr: 'name' | 'property', key: string, content: string) =>
  upsert(
    `meta[${attr}="${key}"]`,
    () => document.createElement('meta'),
    (el) => {
      el.setAttribute(attr, key);
      el.setAttribute('content', content);
    },
  );

/** Keep <head> in sync with the current route during client-side navigation. */
export function useDocumentMeta(route: ResolvedRoute) {
  useEffect(() => {
    const m = pageMeta(route.id, route.lang);
    document.documentElement.lang = route.lang;
    document.title = m.title;
    meta('name', 'description', m.description);
    meta('name', 'robots', m.robots);
    meta('property', 'og:title', m.title);
    meta('property', 'og:description', m.description);
    meta('property', 'og:locale', m.ogLocale);
    meta('property', 'og:image', OG_IMAGE);
    meta('name', 'twitter:title', m.title);
    meta('name', 'twitter:description', m.description);

    document.head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());
    if (m.canonical) {
      meta('property', 'og:url', m.canonical);
      document.head.append(
        Object.assign(document.createElement('link'), { rel: 'canonical', href: m.canonical }),
      );
    }
    for (const alt of m.alternates) {
      const link = Object.assign(document.createElement('link'), { rel: 'alternate', href: alt.href });
      link.setAttribute('hreflang', alt.hreflang);
      document.head.append(link);
    }

    document.head.querySelectorAll('script[data-seo="ld"]').forEach((el) => el.remove());
    for (const block of structuredData(route.id, route.lang)) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seo = 'ld';
      script.textContent = JSON.stringify(block);
      document.head.append(script);
    }
  }, [route.id, route.lang]);
}
