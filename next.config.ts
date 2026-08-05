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
};

export default withNextIntl(nextConfig);
