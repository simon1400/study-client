import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studycz.cz').replace(/\/$/, '');

/**
 * Индексируем всё, кроме личного кабинета, входа, страницы сброса пароля и
 * api-роутов — там либо чужие данные, либо одноразовые ссылки.
 *
 * robots.txt запрещает только обход; чтобы адрес не попал в выдачу вовсе,
 * на тех же страницах стоит `robots: { index: false }` в метаданных.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/user/', '/login', '/reset-password', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
