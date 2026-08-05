import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studycz.cz').replace(/\/$/, '');

/**
 * Индексируем всё, кроме личного кабинета, страницы сброса пароля и api-роутов —
 * там либо чужие данные, либо одноразовые ссылки.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/user/', '/reset-password', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
