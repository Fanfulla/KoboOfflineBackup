import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { legacyHashRoute, pathFor, resolvePath, type Lang, type RouteId } from './routes.ts';
import { NAVIGATE_EVENT, RouterContext, useRouter, type RouterValue } from './context.ts';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

const getPath = () => window.location.pathname;

/**
 * Minimal History-API router. `initialPath` is used for server rendering
 * (prerender) and as the hydration snapshot.
 */
export function RouterProvider({ children, initialPath }: { children: ReactNode; initialPath?: string }) {
  const path = useSyncExternalStore(subscribe, getPath, () => initialPath ?? '/');
  const route = useMemo(() => resolvePath(path), [path]);

  const navigate = useCallback<RouterValue['navigate']>((to, options = {}) => {
    if (to === window.location.pathname && !options.replace) return;
    window.history[options.replace ? 'replaceState' : 'pushState'](options.state ?? null, '', to);
    window.dispatchEvent(new Event(NAVIGATE_EVENT));
  }, []);

  // Redirect legacy hash URLs (e.g. /#faq from the old sitemap).
  useEffect(() => {
    const legacy = legacyHashRoute(window.location.hash);
    if (legacy) navigate(pathFor(legacy, route.lang), { replace: true });
  }, [navigate, route.lang]);

  const value = useMemo(() => ({ path, route, navigate }), [path, route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: RouteId;
  lang?: Lang;
  children: ReactNode;
}

/** Real <a href> (crawlable, middle-click friendly) with client-side navigation. */
export function Link({ to, lang, onClick, children, ...props }: LinkProps) {
  const { navigate, route } = useRouter();
  const href = pathFor(to, lang ?? route.lang);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target && props.target !== '_self') return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-current={route.id === to && !lang ? 'page' : undefined}
      {...props}
    >
      {children}
    </a>
  );
}
