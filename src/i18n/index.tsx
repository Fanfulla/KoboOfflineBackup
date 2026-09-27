import { useMemo, type ReactNode } from 'react';
import { createI18n, I18nContext } from './core.ts';
import type { Lang } from '../router/routes.ts';

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => createI18n(lang), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
