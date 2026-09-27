import { describe, it, expect } from 'vitest';
import { legacyHashRoute, normalizePath, pathFor, resolvePath, ROUTE_IDS, LANGS } from './routes.ts';

describe('routes', () => {
  it('resolves every route in every language (round trip)', () => {
    for (const id of ROUTE_IDS) {
      for (const lang of LANGS) {
        expect(resolvePath(pathFor(id, lang))).toEqual({ id, lang });
      }
    }
  });

  it('uses localized Italian slugs', () => {
    expect(pathFor('restore', 'it')).toBe('/it/ripristino');
    expect(pathFor('library', 'it')).toBe('/it/libreria');
  });

  it('normalizes trailing slashes, duplicate slashes and query strings', () => {
    expect(normalizePath('/faq/')).toBe('/faq');
    expect(normalizePath('//it//guida?x=1')).toBe('/it/guida');
    expect(resolvePath('/it/')).toEqual({ id: 'home', lang: 'it' });
  });

  it('returns notFound with the right language', () => {
    expect(resolvePath('/nope')).toEqual({ id: 'notFound', lang: 'en' });
    expect(resolvePath('/it/nope')).toEqual({ id: 'notFound', lang: 'it' });
  });

  it('maps legacy hash URLs from the old sitemap', () => {
    expect(legacyHashRoute('#faq')).toBe('faq');
    expect(legacyHashRoute('#dashboard')).toBe('library');
    expect(legacyHashRoute('#unknown')).toBeNull();
  });
});
