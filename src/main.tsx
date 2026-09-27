import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/fonts.ts';
import './styles/globals.css';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App path={window.location.pathname} />
  </StrictMode>
);

// Pages are prerendered at build time: hydrate them, render from scratch otherwise (dev).
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
