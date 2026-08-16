import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pm2 на VPS запускает `next start`, поэтому обычная сборка (не standalone)
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // медиа из Strapi лежат в ImageKit (см. миграцию, этап 3)
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      // запасной вариант: файлы, залитые в локальный upload-провайдер Strapi
      { protocol: 'https', hostname: 'admin.studycz.cz' },
    ],
  },
  sassOptions: {
    quietDeps: true,
    // стили 2019 года: darken()/@import живы, но ругаются на каждый файл
    silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'legacy-js-api'],
  },
  async headers() {
    return [
      {
        // Базовая гигиена для всех ответов. HSTS сюда не кладём: заголовок про
        // весь домен, его место в nginx на VPS — иначе он пропадёт, если Next
        // однажды перестанет отдавать какой-то маршрут.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // статика из public/ (герой главной, спрайты, логотипы, шрифты) отдаётся
        // Next с `max-age=0` — при каждом визите тянулись те же ~250 КБ.
        // Имена без хеша, поэтому не `immutable`: сутки в кеше плюс неделя
        // фоновой дораскрутки, обновление картинки доедет к людям за день.
        source: '/:file*.(jpg|jpeg|png|gif|svg|ico|webp|avif|woff|woff2|ttf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
