import type { Metadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, strapiLocale } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { getSingle } from '@/lib/strapi';
import { OG_LOCALES } from '@/lib/seo';
import type { Global } from '@/types/strapi';
import YandexMetrika from '@/components/YandexMetrika';
import SessionProvider from '@/components/auth/SessionProvider';

// Дизайн-система редизайна — единственный файл стилей сайта (§ стайлгайд).
// UIkit и тема старого сайта удалены: переверстаны все страницы.
import '@/styles/ds.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studycz.cz';
const GTM_ID = 'GTM-M3HKN8D';

// Consent mode v2: default denied для всех сигналов ДО загрузки GTM (инлайн — первым
// в body, GTM грузится afterInteractive и гарантированно позже). Если посетитель уже
// согласился раньше (localStorage agree_gdpr=true — ключ старого баннера), сразу granted.
// Update по клику — в src/lib/analytics.ts.
const CONSENT_DEFAULT_JS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
var g='denied';try{if(localStorage.getItem('agree_gdpr')==='true')g='granted'}catch(e){}
gtag('consent','default',{ad_storage:g,ad_user_data:g,ad_personalization:g,analytics_storage:g});`;

// Разрешаем анимации появления (ds.css прячет [data-reveal] только под этим флагом).
// Инлайном первым в body — до отрисовки, чтобы блоки не мигнули до скрытия;
// без JS флага нет и весь контент виден сразу.
const MOTION_FLAG_JS = `document.documentElement.dataset.motion='on'`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const global = await getSingle<Global>('global', { locale: strapiLocale(locale) });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: global?.title ?? 'Study in the Czech Republic',
      // старый Page-компонент клеил заголовки как «Страница | Сайт»
      template: `%s | ${global?.title ?? 'Study in the Czech Republic'}`,
    },
    description: global?.description ?? undefined,
    icons: {
      icon: [
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      shortcut: '/favicon/favicon.ico',
      apple: '/favicon/apple-touch-icon.png',
    },
    manifest: '/favicon/manifest.json',
    openGraph: {
      type: 'website',
      siteName: global?.title ?? undefined,
      // og:url здесь не задаём: он унаследовался бы главной на каждую страницу.
      // Детальные страницы ставят свой, остальным хватает canonical.
      locale: OG_LOCALES[locale],
      images: ['/og-cover.jpg'],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="ds">
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG_JS }} />
        {/* Google Tag Manager и Яндекс.Метрика — те же счётчики, что в старом public/index.html */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_JS }} />
        <GoogleTagManager gtmId={GTM_ID} />
        <YandexMetrika />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Шапка и подвал живут в группе (site): у входа и личного кабинета своя оболочка */}
        <NextIntlClientProvider>
          <SessionProvider>{children}</SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
