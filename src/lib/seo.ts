import type { Metadata } from 'next';
import { routing, strapiLocale } from '@/i18n/routing';
import { getSingle, mediaUrl, strapiFetch } from '@/lib/strapi';
import type { Global, SeoMeta } from '@/types/strapi';

/**
 * Адреса для поисковиков. Пути отдаём относительными — их разрешит `metadataBase`
 * из `src/app/[locale]/layout.tsx`.
 */

/** `/path` → адрес в нужной локали с учётом `localePrefix: 'as-needed'` (uk без префикса). */
export function localePath(locale: string, path: string): string {
  const clean = path === '/' ? '' : path;
  return locale === routing.defaultLocale ? clean || '/' : `/${locale}${clean}`;
}

/** Абсолютный URL — для JSON-LD и sitemap, где относительные не годятся. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studycz.cz').replace(
  /\/$/,
  ''
);

export function absoluteUrl(locale: string, path: string): string {
  const relative = localePath(locale, path);
  return `${SITE_URL}${relative === '/' ? '/' : relative}`;
}

/**
 * canonical своей локали + hreflang на все локали и x-default.
 *
 * Пока переводов в Strapi нет, `/en/...` отдаёт русский текст (см. FALLBACK_LOCALE
 * в `src/lib/strapi.ts`) — это осознанно: canonical у каждой локали свой,
 * hreflang связывает варианты, дубли уйдут по мере заполнения переводов.
 */
export function localeAlternates(locale: string, path: string): Metadata['alternates'] {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)])),
      'x-default': localePath(routing.defaultLocale, path),
    },
  };
}

/** Постоянные `@id` узлов schema.org — на них ссылаются Article, Course и крошки. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** og:locale по коду локали сайта. */
export const OG_LOCALES: Record<string, string> = {
  uk: 'uk_UA',
  ru: 'ru_RU',
  en: 'en_US',
};

/**
 * Общие поля og для страниц, которые задают свой `openGraph`: Next не сливает
 * объект с родительским layout'ом, а заменяет целиком — без этого на детальных
 * страницах пропадали бы `og:site_name` и `og:locale`.
 *
 * Запрос к `global` тот же, что в корневом layout, и в пределах одного рендера
 * отдаётся из кеша fetch — лишнего похода в Strapi нет.
 */
export async function ogBase(locale: string) {
  const global = await getSingle<Global>('global', { locale: strapiLocale(locale) });
  return {
    siteName: global?.title ?? undefined,
    locale: OG_LOCALES[locale],
  };
}

/** Populate компонента seo вместе с картинкой — для запросов к Strapi. */
const SEO_POPULATE = { seo: { populate: { ogImage: true } } } as const;

/**
 * Мета-теги из админки — отдельным лёгким запросом, а не внутри основного
 * populate страницы. Так порядок деплоя перестаёт иметь значение: пока схема
 * Strapi без компонента `seo`, запрос отвечает 400 «Invalid key seo», мы молча
 * отдаём null и страница живёт на вычисленных мета-тегах.
 *
 * Ошибку глотаем целиком и только здесь: SEO-переопределение — украшение,
 * из-за него не должна падать ни страница, ни сборка.
 */
export async function getSeoMeta(
  plural: string,
  { locale, slug }: { locale: string; slug?: string }
): Promise<SeoMeta | null> {
  try {
    const query = {
      fields: ['id'],
      populate: SEO_POPULATE,
      ...(slug ? { filters: { slug: { $eq: slug } }, pagination: { pageSize: 1 } } : {}),
    };

    const { data } = await strapiFetch<{ seo: SeoMeta | null } | Array<{ seo: SeoMeta | null }>>(
      plural,
      { locale: strapiLocale(locale), ...query },
      [plural]
    );

    const item = Array.isArray(data) ? data[0] : data;
    return item?.seo ?? null;
  } catch {
    return null;
  }
}

/**
 * Накладывает ручные мета-теги из админки (`shared.seo`) поверх вычисленных.
 * Пустое поле в CMS ничего не перекрывает — редактор заполняет только то,
 * что действительно хочет переопределить.
 *
 * `noIndex` закрывает страницу от индексации: canonical и hreflang при этом
 * остаются — они не мешают, а сигнал «не индексировать» даёт meta-robots.
 */
export function withSeoOverrides(base: Metadata, seo: SeoMeta | null | undefined): Metadata {
  if (!seo) return base;

  const ogImage = mediaUrl(seo.ogImage, { width: 1200, height: 630 });
  const result: Metadata = { ...base };

  if (seo.metaTitle) {
    // absolute — редактор задаёт заголовок целиком, шаблон «… | Сайт» не навешиваем
    result.title = { absolute: seo.metaTitle };
  }
  if (seo.metaDescription) result.description = seo.metaDescription;
  if (seo.noIndex) result.robots = { index: false, follow: false };

  if (seo.metaTitle || seo.metaDescription || ogImage) {
    result.openGraph = {
      ...base.openGraph,
      ...(seo.metaTitle ? { title: seo.metaTitle } : {}),
      ...(seo.metaDescription ? { description: seo.metaDescription } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    };
  }

  return result;
}
