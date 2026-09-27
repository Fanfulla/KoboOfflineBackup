import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import { resolvePath } from './router/routes.ts';
import './styles/fonts.ts';
import './styles/globals.css';

const container = document.getElementById('root')!;
const path = window.location.pathname;
const app = (
  <StrictMode>
    <App path={path} />
  </StrictMode>
);

// Hydrate the prerendered page when it was rendered for this route (the
// shared 404.html is English-only: /it/unknown renders from scratch instead).
const prerendered = container.dataset.path;
const sameRoute =
  prerendered !== undefined && JSON.stringify(resolvePath(prerendered)) === JSON.stringify(resolvePath(path));

if (container.firstElementChild && sameRoute) {
  hydrateRoot(container, app);
} else {
  container.textContent = '';
  createRoot(container).render(app);
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.warn('[SW] registration failed:', error));
  });
}
