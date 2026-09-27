import { createContext, useContext } from 'react';
import en, { type Messages } from './en.ts';
import it from './it.ts';
import type { Lang } from '../router/routes.ts';

export type { Messages };

export const MESSAGES: Record<Lang, Messages> = { en, it };

const LOCALES: Record<Lang, string> = { en: 'en-US', it: 'it-IT' };

export interface PluralForms {
  one: string;
  other: string;
}

type Params = Record<string, string | number>;

/** Replace {name} placeholders. */
export function fmt(template: string, params: Params = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function createI18n(lang: Lang) {
  const m = MESSAGES[lang];
  const locale = LOCALES[lang];
  const pluralRules = new Intl.PluralRules(locale);
  const number = new Intl.NumberFormat(locale);

  const plural = (forms: PluralForms, count: number, params: Params = {}) =>
    fmt(pluralRules.select(count) === 'one' ? forms.one : forms.other, {
      count: number.format(count),
      ...params,
    });

  const formatDate = (value: Date | string | null | undefined, options: Intl.DateTimeFormatOptions = {}) => {
    if (!value) return m.common.unknown;
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return m.common.unknown;
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', ...options }).format(date);
  };

  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes || bytes < 0) return `0 ${m.units.bytes[0]}`;
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), m.units.bytes.length - 1);
    const value = bytes / 1024 ** i;
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: i === 0 ? 0 : 1 }).format(value)} ${m.units.bytes[i]}`;
  };

  /** Minutes → "12 h 30 m". */
  const formatDuration = (minutes: number | null | undefined) => {
    const total = Math.max(0, Math.round(minutes ?? 0));
    const h = Math.floor(total / 60);
    const min = total % 60;
    if (h === 0) return `${min} ${m.units.minutes}`;
    return min === 0
      ? `${number.format(h)} ${m.units.hours}`
      : `${number.format(h)} ${m.units.hours} ${min} ${m.units.minutes}`;
  };

  return {
    lang,
    locale,
    m,
    fmt,
    plural,
    formatDate,
    formatBytes,
    formatNumber: (n: number) => number.format(n),
    formatDuration,
  };
}

export type I18n = ReturnType<typeof createI18n>;

export const I18nContext = createContext<I18n>(createI18n('en'));

export function useI18n(): I18n {
  return useContext(I18nContext);
}

/** Localized message for an error code, falling back to the technical message. */
export function errorText(i18n: I18n, error: { code: string; message: string }): string {
  return (i18n.m.errors.codes as Record<string, string>)[error.code] ?? error.message;
}
