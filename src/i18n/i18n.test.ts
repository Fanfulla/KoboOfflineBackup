import { describe, it, expect } from 'vitest';
import { createI18n, fmt, MESSAGES } from './core.ts';

type Tree = string | Tree[] | { [key: string]: Tree };

function leaves(tree: Tree, path = ''): [string, string][] {
  if (typeof tree === 'string') return [[path, tree]];
  if (Array.isArray(tree)) return tree.flatMap((t, i) => leaves(t, `${path}[${i}]`));
  return Object.entries(tree).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('translations', () => {
  const en = new Map(leaves(MESSAGES.en as unknown as Tree));
  const it_ = new Map(leaves(MESSAGES.it as unknown as Tree));

  it('Italian has exactly the same keys as English', () => {
    expect([...it_.keys()].sort()).toEqual([...en.keys()].sort());
  });

  it('no translation is empty', () => {
    for (const [key, value] of it_) expect(value.trim(), key).not.toBe('');
  });

  it('placeholders match between languages', () => {
    for (const [key, value] of en) {
      // Plural "one" forms may omit {count} (e.g. "e un altro libro").
      if (key.endsWith('.one')) continue;
      expect(placeholders(it_.get(key)!), key).toEqual(placeholders(value));
    }
  });

  it('SEO titles and descriptions have search-friendly lengths', () => {
    for (const lang of ['en', 'it'] as const) {
      for (const [id, page] of Object.entries(MESSAGES[lang].meta.pages)) {
        if (id === 'notFound') continue; // noindex
        expect(page.title.length, `${lang}.${id}.title`).toBeLessThanOrEqual(90);
        expect(page.description.length, `${lang}.${id}.description`).toBeLessThanOrEqual(200);
        expect(page.description.length, `${lang}.${id}.description`).toBeGreaterThan(40);
      }
    }
  });
});

describe('formatting helpers', () => {
  it('interpolates placeholders and leaves unknown ones', () => {
    expect(fmt('{a} and {b}', { a: 1 })).toBe('1 and {b}');
  });

  it('pluralizes and formats per locale', () => {
    const en = createI18n('en');
    const it = createI18n('it');
    expect(en.plural(en.m.common.books, 1)).toBe('1 book');
    expect(en.plural(en.m.common.books, 1234)).toBe('1,234 books');
    expect(it.plural(it.m.common.books, 12345)).toBe('12.345 libri');
    expect(it.formatDuration(1419)).toBe('23 h 39 min');
    expect(en.formatBytes(1536)).toBe('1.5 KB');
    expect(it.formatBytes(1536)).toBe('1,5 KB');
  });
});
