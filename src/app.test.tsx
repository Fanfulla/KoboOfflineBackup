/**
 * Server-renders every route in every language: this is exactly what the
 * build-time prerenderer does, so it guards against browser-only code in render.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App.tsx';
import { LANGS, ROUTE_IDS, pathFor } from './router/routes.ts';
import { MESSAGES } from './i18n/core.ts';

describe('server rendering', () => {
  for (const lang of LANGS) {
    for (const id of ROUTE_IDS) {
      it(`renders ${pathFor(id, lang)}`, () => {
        const html = renderToString(<App path={pathFor(id, lang)} />);
        expect(html).toContain('<h1');
        expect(html).toContain(MESSAGES[lang].common.skipToContent);
        // Language switcher links to the same page in the other language.
        const other = lang === 'en' ? 'it' : 'en';
        expect(html).toContain(`href="${pathFor(id, other)}"`);
      });
    }
  }

  it('renders the 404 page for unknown paths', () => {
    expect(renderToString(<App path="/does-not-exist" />)).toContain(MESSAGES.en.notFound.title);
    expect(renderToString(<App path="/it/non-esiste" />)).toContain(MESSAGES.it.notFound.title);
  });

  it('puts FAQ answers in the HTML (crawlable, not behind JS)', () => {
    const html = renderToString(<App path="/it/faq" />);
    expect(html).toContain(MESSAGES.it.faq.categories[0]!.items[0]!.a.slice(0, 40));
  });
});
