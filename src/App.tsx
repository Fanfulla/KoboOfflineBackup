import { useEffect, type ComponentType } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { RouterProvider } from './router/Router.tsx';
import { useRouter } from './router/context.ts';
import type { RouteId } from './router/routes.ts';
import { useI18n } from './i18n/core.ts';
import { I18nProvider } from './i18n/index.tsx';
import { useDocumentMeta } from './seo/useDocumentMeta.ts';
import { useKoboStore } from './stores/koboStore.ts';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { BrowserNotice } from './components/BrowserNotice.tsx';
import { AnalyticsBanner } from './components/AnalyticsBanner.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Home } from './pages/Home.tsx';
import { Backup } from './pages/Backup.tsx';
import { Restore } from './pages/Restore.tsx';
import { Library } from './pages/Library.tsx';
import { History } from './pages/History.tsx';
import { Guide } from './pages/Guide.tsx';
import { Faq } from './pages/Faq.tsx';
import { Privacy } from './pages/Privacy.tsx';
import { NotFound } from './pages/NotFound.tsx';

const PAGES: Record<RouteId | 'notFound', ComponentType> = {
  home: Home,
  backup: Backup,
  restore: Restore,
  library: Library,
  history: History,
  guide: Guide,
  faq: Faq,
  privacy: Privacy,
  notFound: NotFound,
};

function Shell() {
  const { route, path } = useRouter();
  const { m } = useI18n();
  const Page = PAGES[route.id];
  useDocumentMeta(route);

  // Persisted history is loaded after hydration so the prerendered HTML matches.
  useEffect(() => {
    void useKoboStore.persist.rehydrate();
  }, []);

  // Move focus to the page on navigation (screen readers announce the new page).
  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      document.getElementById('main')?.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0 });
  }, [path]);

  return (
    <div className="flex min-h-screen flex-col bg-kobo-cream">
      <a
        href="#main"
        className="sr-only z-50 rounded bg-kobo-dark px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {m.common.skipToContent}
      </a>
      <BrowserNotice />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-hidden">
        <ErrorBoundary resetKey={path}>
          <Page />
        </ErrorBoundary>
      </main>
      <Footer />
      <AnalyticsBanner />
      {import.meta.env.PROD && !import.meta.env.SSR && <Analytics />}
    </div>
  );
}

function LocalizedShell() {
  const { route } = useRouter();
  return (
    <I18nProvider lang={route.lang}>
      <Shell />
    </I18nProvider>
  );
}

export default function App({ path }: { path?: string }) {
  return (
    <RouterProvider initialPath={path}>
      <LocalizedShell />
    </RouterProvider>
  );
}
