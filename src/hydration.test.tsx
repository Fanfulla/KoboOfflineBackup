// @vitest-environment happy-dom
/**
 * The prerendered HTML must hydrate without mismatches, otherwise React
 * throws the server markup away (slower first paint, lost SEO benefit).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { StrictMode, act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { render } from './entry-server.tsx';
import App from './App.tsx';
import { LANGS, ROUTE_IDS, pathFor } from './router/routes.ts';

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

describe('hydration of prerendered pages', () => {
  for (const lang of LANGS) {
    for (const id of ROUTE_IDS) {
      const path = pathFor(id, lang);
      it(`hydrates ${path} without mismatches`, async () => {
        const { html } = render(path);
        window.history.replaceState(null, '', path);
        document.body.innerHTML = `<div id="root">${html}</div>`;
        const container = document.getElementById('root')!;
        const errors: unknown[] = [];

        await act(async () => {
          root = hydrateRoot(
            container,
            <StrictMode>
              <App path={path} />
            </StrictMode>,
            { onRecoverableError: (error) => errors.push(error) },
          );
        });

        expect(errors).toEqual([]);
        expect(container.querySelector('h1')).not.toBeNull();
      });
    }
  }
});
