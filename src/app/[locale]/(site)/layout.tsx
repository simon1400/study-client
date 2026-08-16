import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

  return (
    <RegistrationProvider>
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </RegistrationProvider>
  );
}
