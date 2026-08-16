import { strapiLocale } from '@/i18n/routing';
import { getSingle } from '@/lib/strapi';
import { absoluteUrl, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/lib/seo';
import type { Global } from '@/types/strapi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/JsonLd';
import RegistrationProvider from '@/components/auth/RegistrationProvider';

/**
 * Оболочка публичного сайта: шапка, контент, подвал и модалка заявки.
 *
 * Вынесена в группу `(site)`, потому что у страницы входа (`/login`) и личного
 * кабинета (`/user/*`) по макету редизайна своя шапка и никакого подвала —
 * а адреса при этом остаются прежними: группа в URL не участвует.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const global = await getSingle<Global>('global', {
    locale: strapiLocale(locale),
    query: { populate: { socLinks: true, contacts: true } },
  });

  const name = global?.title ?? 'Study in the Czech Republic';
  const sameAs = [
    global?.socLinks?.facebook,
    global?.socLinks?.instagram,
    global?.socLinks?.vkontakte,
  ].filter((url): url is string => Boolean(url));

  // Организация и сайт — одни и те же узлы на всех страницах: на их `@id`
  // ссылаются Article (publisher) и Course (provider), поэтому разметка живёт
  // в оболочке сайта, а не на главной.
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': ORGANIZATION_ID,
        name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        ...(sameAs.length ? { sameAs } : {}),
        ...(global?.contacts?.email || global?.contacts?.phone
          ? {
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                ...(global.contacts.email ? { email: global.contacts.email } : {}),
                ...(global.contacts.phone ? { telephone: global.contacts.phone } : {}),
                availableLanguage: ['uk', 'ru', 'en'],
              },
            }
          : {}),
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name,
        url: absoluteUrl(locale, '/'),
        inLanguage: locale,
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  };

  return (
    <RegistrationProvider>
      <JsonLd data={graph} />
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </RegistrationProvider>
  );
}
