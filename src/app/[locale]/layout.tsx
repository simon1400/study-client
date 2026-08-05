import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, strapiLocale } from '@/i18n/routing';
import { getSingle } from '@/lib/strapi';
import type { Global } from '@/types/strapi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UikitInit from '@/components/UikitInit';

// порядок как на старом сайте: UIkit из CDN в index.html, затем бандл app.css
// (тема + свой UIkit) и правки поверх
import 'uikit/dist/css/uikit.min.css';
import '@/styles/theme.css';
import '@/styles/style.scss';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://studycz.cz';
const GTM_ID = 'GTM-M3HKN8D';
const YANDEX_METRIKA_ID = 53724796;

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
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <NextIntlClientProvider>
          <UikitInit />
          <Header locale={locale} />
          {children}
          <Footer locale={locale} />
        </NextIntlClientProvider>

        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${YANDEX_METRIKA_ID}, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true});`}
        </Script>
      </body>
    </html>
  );
}
