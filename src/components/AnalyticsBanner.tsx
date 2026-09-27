import { Link } from '../router/Router.tsx';
import { useI18n } from '../i18n/core.ts';
import { useLocalFlag } from '../hooks/useLocalFlag.ts';

/** One-time disclosure of the cookieless analytics. */
export function AnalyticsBanner() {
  const { m } = useI18n();
  const [dismissed, dismiss] = useLocalFlag('analytics_banner_dismissed');
  if (dismissed) return null;

  return (
    <section
      aria-label={m.analytics.policy}
      className="fixed inset-x-0 bottom-0 z-50 bg-kobo-dark text-kobo-cream shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p className="flex-1 text-sm">
          {m.analytics.text}{' '}
          <Link to="privacy" className="text-kobo-accent underline hover:text-white" onClick={dismiss}>
            {m.analytics.policy}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded bg-kobo-accent px-4 py-1.5 text-sm font-semibold text-kobo-dark hover:bg-kobo-accent/90 focus-visible-ring"
        >
          {m.analytics.ok}
        </button>
      </div>
    </section>
  );
}
