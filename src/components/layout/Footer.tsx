import { Link } from '../../router/Router.tsx';
import { useI18n } from '../../i18n/core.ts';
import { REPO_URL } from '../../seo/meta.ts';
import { Icon } from '../common/Icon.tsx';

export function Footer() {
  const { m, fmt } = useI18n();
  const linkClass =
    'text-kobo-cream/80 hover:text-white underline-offset-4 hover:underline focus-visible-ring rounded-sm';

  return (
    <footer className="mt-16 bg-kobo-dark py-10 text-kobo-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="mb-3 font-display text-lg font-bold">KoBup</p>
          <p className="text-sm text-kobo-cream/80">{m.footer.about}</p>
        </div>

        <nav aria-label={m.footer.resources}>
          <p className="mb-3 font-display text-lg font-bold">{m.footer.resources}</p>
          <ul className="space-y-2 text-sm">
            {(['guide', 'faq', 'privacy', 'history'] as const).map((id) => (
              <li key={id}>
                <Link to={id} className={linkClass}>
                  {m.nav[id]}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} inline-flex items-center gap-1`}
              >
                {m.footer.github}
                <Icon type="external" size="sm" />
                <span className="sr-only">{m.common.opensInNewTab}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-3 font-display text-lg font-bold">{m.footer.privacyTitle}</p>
          <ul className="space-y-2 text-sm text-kobo-cream/80">
            {m.footer.badges.map((badge) => (
              <li key={badge} className="flex items-start gap-2">
                <Icon type="check" className="mt-0.5 shrink-0 text-kobo-success" />
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-kobo-cream/20 px-4 pt-6 text-center text-sm text-kobo-cream/70 sm:px-6 lg:px-8">
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} KoBup · {m.footer.disclaimer} ·{' '}
          {fmt(m.footer.version, { version: __APP_VERSION__ })}
        </p>
      </div>
    </footer>
  );
}
