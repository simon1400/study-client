import type { MetadataRoute } from 'next';
import { routing, strapiLocale } from '@/i18n/routing';
import { getCollection } from '@/lib/strapi';

/**
 * Карта сайта. Разделы перечислены руками (их немного и они не меняются),
 * карточки — из Strapi по тем же slug'ам, что и на старом сайте.
 *
 * `/user/*` и `/reset-password` сюда не попадают: это личные страницы,
 * закрытые от индексации в robots.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studycz.cz').replace(/\/$/, '');

/** Разделы: путь → приоритет и частота обновления. */
const SECTIONS: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
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

/** Коллекции с детальными страницами: множественное имя в Strapi → префикс URL. */
const COLLECTIONS: Array<{ plural: string; prefix: string }> = [
  { plural: 'programs', prefix: '/program' },
  { plural: 'universities', prefix: '/university' },
  { plural: 'livings', prefix: '/living' },
  { plural: 'articles', prefix: '/blog' },
];

type Sluggable = { slug: string; updatedAt?: string | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locale = strapiLocale(routing.defaultLocale);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = SECTIONS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const collections = await Promise.all(
    COLLECTIONS.map(async ({ plural, prefix }) => {
      // если Strapi недоступен, карта сайта всё равно отдаётся — с одними разделами
      try {
        const items = await getCollection<Sluggable>(plural, {
          locale,
          query: { fields: ['slug', 'updatedAt'] },
        });
        return items
          .filter((item) => item.slug)
          .map((item) => ({
            url: `${SITE_URL}${prefix}/${item.slug}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
          }));
      } catch {
        return [];
      }
    })
  );

  return [...entries, ...collections.flat()];
}
