import { defineRouting } from 'next-intl/routing';

/**
 * Языки редизайна: переключатель в шапке — RU / UA / CZ / EN.
 * `localePrefix: 'as-needed'` — русские адреса остаются без префикса, 1:1 со старым
 * сайтом, остальные получают /uk, /cz, /en.
 *
 * Контент в Strapi заполнен пока только в `ru`; если перевода нет, `src/lib/strapi.ts`
 * молча отдаёт русскую версию (см. FALLBACK_LOCALE), поэтому пустых страниц не бывает.
 */
export const routing = defineRouting({
  locales: ['ru', 'uk', 'cz', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

/** Локаль в URL → код локали в Strapi (чешский там ISO-шный `cs`). */
const LOCALE_TO_STRAPI: Record<string, string> = {
  ru: 'ru',
  uk: 'uk',
  cz: 'cs',
  en: 'en',
};

export function strapiLocale(locale: string): string {
  return LOCALE_TO_STRAPI[locale] ?? routing.defaultLocale;
}

/** Подписи в переключателе языков — на своём же языке. */
export const LOCALE_LABELS: Record<Locale, { short: string; full: string }> = {
  ru: { short: 'RU', full: 'Русский' },
  uk: { short: 'UA', full: 'Українська' },
  cz: { short: 'CZ', full: 'Čeština' },
  en: { short: 'EN', full: 'English' },
};

/** Значение атрибута lang у <html> (в URL `cz`, по стандарту — `cs`). */
export function htmlLang(locale: string): string {
  return locale === 'cz' ? 'cs' : locale;
}
