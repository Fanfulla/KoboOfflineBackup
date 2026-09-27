import { useState } from 'react';
import { Link } from '../../router/Router.tsx';
import { useRouter } from '../../router/context.ts';
import { pathFor, type RouteId } from '../../router/routes.ts';
import { useI18n } from '../../i18n/core.ts';
import { Icon } from '../common/Icon.tsx';

const NAV: RouteId[] = ['home', 'backup', 'restore', 'library', 'history'];

export function Logo() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-kobo-accent to-kobo-accent-dark">
      <Icon type="book" size={24} className="text-white" />
    </span>
  );
}

export function Header() {
  const { m, lang } = useI18n();
  const { route, navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const otherLang = lang === 'en' ? 'it' : 'en';
  const otherHref = route.id === 'notFound' ? pathFor('home', otherLang) : pathFor(route.id, otherLang);

  const linkClass = (id: RouteId) =>
    `rounded-lg px-3 py-2 font-medium transition-colors focus-visible-ring ${
      route.id === id
        ? 'bg-kobo-accent text-kobo-dark'
        : 'text-kobo-gray hover:bg-kobo-cream-dark hover:text-kobo-dark'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="home"
          className="flex items-center gap-3 rounded-lg focus-visible-ring"
          aria-label={m.nav.logoLabel}
        >
          <Logo />
          <span className="hidden sm:block">
            <span className="block font-display text-xl font-bold text-kobo-dark">KoBup</span>
            <span className="block text-xs text-kobo-gray">{m.meta.tagline}</span>
          </span>
        </Link>

        <nav aria-label={m.nav.label} className="hidden items-center gap-1 md:flex">
          {NAV.map((id) => (
            <Link key={id} to={id} className={linkClass(id)}>
              {m.nav[id]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={otherHref}
            hrefLang={otherLang}
            lang={otherLang}
            aria-label={m.nav.switchLanguageLabel}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              navigate(otherHref);
            }}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-kobo-gray hover:bg-kobo-cream-dark hover:text-kobo-dark focus-visible-ring"
          >
            <Icon type="globe" size="sm" />
            {m.nav.switchLanguage}
          </a>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-kobo-cream-dark focus-visible-ring md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? m.nav.closeMenu : m.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon type={open ? 'x' : 'menu'} size="lg" className="text-kobo-dark" />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={m.nav.label}
          className="animate-slide-down border-t border-kobo-cream-dark px-4 py-3 md:hidden"
        >
          {NAV.map((id) => (
            <Link key={id} to={id} className={`block ${linkClass(id)}`} onClick={() => setOpen(false)}>
              {m.nav[id]}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
