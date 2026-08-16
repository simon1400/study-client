import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getSession } from '@/lib/account';
import { getCollection, getSingle } from '@/lib/strapi';
import type { Global, Program } from '@/types/strapi';
import Dashboard from '@/components/user/Dashboard';
import type { ProgramOption } from '@/components/user/SelectProgramModal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'user.nav' });
  return { title: t('overview'), robots: { index: false, follow: false } };
}

/** Обзор личного кабинета: путь студента из четырёх шагов (макет «Дашборд»). */
export default async function CabinetOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSession();
  if (!user) redirect('/login');

  const strapi = strapiLocale(locale);
  const [programs, global] = await Promise.all([
    getCollection<Program>('programs', {
      locale: strapi,
      query: { fields: ['title', 'price', 'order'], populate: { period: true, city: { fields: ['title'] } } },
    }),
    getSingle<Global>('global', { locale: strapi, query: { populate: '*' } }),
  ]);

  const options: ProgramOption[] = programs.map((program) => ({
    title: program.title,
    price: program.price ?? '',
    // на старом сайте в карточку пользователя уезжала дата начала курса
    dateCourse: program.period?.from ?? '',
    group: program.city?.title ?? null,
  }));

  return (
    <Dashboard
      user={user}
      programs={options}
      locale={locale}
      // процент предоплаты задаётся в шаблоне договора; до его заполнения — стандартные 50%
      prepayPercent={50}
      supportEmail={global?.contacts?.email ?? 'info@studycz.cz'}
      supportPhone={global?.contacts?.phone ?? null}
    />
  );
}
