import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function read(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * A boolean persisted in localStorage. On the server (prerender) it reads as
 * `serverValue`, so the static HTML never contains client-only UI.
 */
export function useLocalFlag(key: string, serverValue = true): [boolean, () => void] {
  const value = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => read(key),
    () => serverValue,
  );
  const set = useCallback(() => {
    try {
      localStorage.setItem(key, '1');
    } catch {
      // storage unavailable (private mode): the flag only lasts for this page
    }
    listeners.forEach((l) => l());
  }, [key]);
  return [value, set];
}
