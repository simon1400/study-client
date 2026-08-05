import { defineRouting } from 'next-intl/routing';

/**
 * Пока в Strapi заполнена только базовая локаль `ru` (миграция, этап 3),
 * поэтому активна одна локаль и префикса в URL нет — адреса 1:1 со старым сайтом.
 * Когда появятся переводы, локаль добавляется сюда и в `LOCALE_TO_STRAPI`;
 * с `localePrefix: 'as-needed'` русские URL при этом не меняются.
 */
export const routing = defineRouting({
  locales: ['ru'],
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
