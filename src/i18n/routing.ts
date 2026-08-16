import { defineRouting } from 'next-intl/routing';

/**
 * Языки сайта: переключатель в шапке — UA / RU / EN.
 * Основной язык с 2026-08-16 — украинский: `localePrefix: 'as-needed'` оставляет
 * его адреса без префикса, русский и английский получают /ru и /en.
 *
 * Контент в Strapi заполнен пока только в `ru`; если перевода нет, `src/lib/strapi.ts`
 * молча отдаёт русскую версию (см. FALLBACK_LOCALE), поэтому пустых страниц не бывает.
 */
export const routing = defineRouting({
  locales: ['uk', 'ru', 'en'],
  defaultLocale: 'uk',
  localePrefix: 'as-needed',
  // Каждый адрес всегда отдаёт свою локаль: без редиректов по cookie/Accept-Language
  // ответ на URL один и тот же для краулера, кеша и человека по ссылке.
  // Язык посетитель выбирает переключателем в шапке (решение 2026-08-16).
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

/** Локаль в URL → код локали в Strapi (совпадают, но маппинг оставлен точкой входа). */
const LOCALE_TO_STRAPI: Record<string, string> = {
  uk: 'uk',
  ru: 'ru',
  en: 'en',
};

export function strapiLocale(locale: string): string {
  return LOCALE_TO_STRAPI[locale] ?? routing.defaultLocale;
}

/** Подписи в переключателе языков — на своём же языке. */
export const LOCALE_LABELS: Record<Locale, { short: string; full: string }> = {
  uk: { short: 'UA', full: 'Українська' },
  ru: { short: 'RU', full: 'Русский' },
  en: { short: 'EN', full: 'English' },
};
