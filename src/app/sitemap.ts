import type { MetadataRoute } from 'next';
import { routing, strapiLocale } from '@/i18n/routing';
import { getAllPages } from '@/lib/strapi';
import { absoluteUrl } from '@/lib/seo';

/**
 * Карта сайта. Разделы перечислены руками (их немного и они не меняются),
 * карточки — из Strapi по тем же slug'ам, что и на старом сайте.
 *
 * Каждый адрес попадает в карту трижды — по разу на локаль (uk без префикса,
 * /ru, /en), и у каждой записи `alternates.languages` со всеми вариантами:
 * так Google видит переводы даже без hreflang в HTML.
 *
 * `/user/*` и `/reset-password` сюда не попадают: это личные страницы,
 * закрытые от индексации в robots.
 */

/** Разделы: путь → приоритет и частота обновления. */
const SECTIONS: Array<{
  path: string;
  priority: number;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
}> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/program', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/university', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/living', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/partners', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/agents', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contacts', priority: 0.6, changeFrequency: 'monthly' },
];

/**
 * Коллекции с детальными страницами: множественное имя в Strapi → префикс URL.
 * `pages` — технические страницы (защита данных, оферта); они живут в корне,
 * поэтому префикс пустой, а приоритет ниже разделов.
 */
const COLLECTIONS: Array<{ plural: string; prefix: string; priority?: number }> = [
  { plural: 'programs', prefix: '/program' },
  { plural: 'universities', prefix: '/university' },
  { plural: 'livings', prefix: '/living' },
  { plural: 'articles', prefix: '/blog' },
  { plural: 'pages', prefix: '', priority: 0.3 },
];

type Sluggable = { slug: string; updatedAt?: string | null };

/** Один путь → по записи на локаль, у каждой — ссылки на все переводы. */
function entriesForPath(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>
): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, path)])),
    'x-default': absoluteUrl(routing.defaultLocale, path),
  };

  return routing.locales.map((locale) => ({
    url: absoluteUrl(locale, path),
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // слуги берём в русской локали: контент заполнен в ней, адреса у всех локалей общие
  const locale = strapiLocale('ru');

  // lastModified у разделов не ставим: у них нет честной даты изменения,
  // а «сегодня» на каждой перегенерации — сигнал, который Google быстро обесценивает
  const sections = SECTIONS.flatMap(({ path, priority, changeFrequency }) =>
    entriesForPath(path, { changeFrequency, priority })
  );

  const collections = await Promise.all(
    COLLECTIONS.map(async ({ plural, prefix, priority = 0.7 }) => {
      // если Strapi недоступен, карта сайта всё равно отдаётся — с одними разделами
      try {
        const items = await getAllPages<Sluggable>(plural, {
          locale,
          query: { fields: ['slug', 'updatedAt'] },
        });
        return items
          .filter((item) => item.slug)
          .flatMap((item) =>
            entriesForPath(`${prefix}/${item.slug}`, {
              lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
              changeFrequency: 'monthly' as const,
              priority,
            })
          );
      } catch {
        return [];
      }
    })
  );

  return [...sections, ...collections.flat()];
}
