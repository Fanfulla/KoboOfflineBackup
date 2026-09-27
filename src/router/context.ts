import { createContext, useCallback, useContext } from 'react';
import { pathFor, type Lang, type ResolvedRoute, type RouteId } from './routes.ts';

export interface RouterValue {
  path: string;
  route: ResolvedRoute;
  navigate: (to: string, options?: { replace?: boolean; state?: unknown }) => void;
}

export const RouterContext = createContext<RouterValue | null>(null);

export const NAVIGATE_EVENT = 'kobup:navigate';

export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error('useRouter must be used inside <RouterProvider>');
  return value;
}

/** Navigate to a route in the current language. */
export function useNavigateTo() {
  const { navigate, route } = useRouter();
  return useCallback(
    (id: RouteId, lang: Lang = route.lang) => navigate(pathFor(id, lang)),
    [navigate, route.lang],
  );
}
