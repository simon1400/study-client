import type { Metadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, strapiLocale } from '@/i18n/routing';
import { getSingle } from '@/lib/strapi';
import type { Global } from '@/types/strapi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UikitInit from '@/components/UikitInit';
import YandexMetrika from '@/components/YandexMetrika';
import SessionProvider from '@/components/auth/SessionProvider';
import AuthModals from '@/components/auth/AuthModals';

// порядок как на старом сайте: UIkit из CDN в index.html, затем бандл app.css
// (тема + свой UIkit) и правки поверх
import 'uikit/dist/css/uikit.min.css';
import '@/styles/theme.css';
import '@/styles/style.scss';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studycz.cz';
const GTM_ID = 'GTM-M3HKN8D';

// Consent mode v2: default denied для всех сигналов ДО загрузки GTM (инлайн — первым
// в body, GTM грузится afterInteractive и гарантированно позже). Если посетитель уже
// согласился раньше (localStorage agree_gdpr=true — ключ старого баннера), сразу granted.
// Update по клику — в src/lib/analytics.ts.
const CONSENT_DEFAULT_JS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
var g='denied';try{if(localStorage.getItem('agree_gdpr')==='true')g='granted'}catch(e){}
gtag('consent','default',{ad_storage:g,ad_user_data:g,ad_personalization:g,analytics_storage:g});`;

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
      url: SITE_URL,
    },
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
    <html lang={locale}>
      <body>
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

        <NextIntlClientProvider>
          <SessionProvider>
            <UikitInit />
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
            <AuthModals />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
