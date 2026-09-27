/**
 * Route table. Every page exists in English (no prefix) and Italian (/it/...),
 * with localized slugs for better search ranking in each language.
 */

export const LANGS = ['en', 'it'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const ROUTES = {
  home: { en: '/', it: '/it' },
  backup: { en: '/backup', it: '/it/backup' },
  restore: { en: '/restore', it: '/it/ripristino' },
  library: { en: '/library', it: '/it/libreria' },
  history: { en: '/history', it: '/it/cronologia' },
  guide: { en: '/guide', it: '/it/guida' },
  faq: { en: '/faq', it: '/it/faq' },
  privacy: { en: '/privacy', it: '/it/privacy' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteId = keyof typeof ROUTES;

export const ROUTE_IDS = Object.keys(ROUTES) as RouteId[];

/** Pages that are pure content and worth indexing. */
export const INDEXABLE_ROUTES: RouteId[] = [
  'home',
  'backup',
  'restore',
  'library',
  'guide',
  'faq',
  'privacy',
];

export interface ResolvedRoute {
  id: RouteId | 'notFound';
  lang: Lang;
}

export function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0]!.replace(/\/{2,}/g, '/');
  return clean.length > 1 ? clean.replace(/\/+$/, '') || '/' : '/';
}

export function resolvePath(pathname: string): ResolvedRoute {
  const path = normalizePath(pathname);
  for (const id of ROUTE_IDS) {
    for (const lang of LANGS) {
      if (ROUTES[id][lang] === path) return { id, lang };
    }
  }
  const lang: Lang = path === '/it' || path.startsWith('/it/') ? 'it' : DEFAULT_LANG;
  return { id: 'notFound', lang };
}

export function pathFor(id: RouteId, lang: Lang): string {
  return ROUTES[id][lang];
}

/** Old hash-based URLs (kobup.org/#faq) → path routes. */
export function legacyHashRoute(hash: string): RouteId | null {
  const id = hash.replace(/^#\/?/, '');
  if (id === 'dashboard') return 'library';
  return (ROUTE_IDS as string[]).includes(id) ? (id as RouteId) : null;
}
