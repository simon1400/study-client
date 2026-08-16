import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getSession } from '@/lib/account';
import { getSingle } from '@/lib/strapi';
import type { Global } from '@/types/strapi';
import LoginForm from './LoginForm';

/** Страница входа персональная — кешировать нечего. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'login' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // уже вошёл — незачем показывать форму
  if (await getSession()) redirect('/user');

  const global = await getSingle<Global>('global', {
    locale: strapiLocale(locale),
    query: { populate: '*' },
  });

  return <LoginForm supportEmail={global?.contacts?.email ?? 'info@studycz.cz'} />;
}
