import { redirect } from 'next/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getSession } from '@/lib/account';
import { getSingle } from '@/lib/strapi';
import type { Global } from '@/types/strapi';
import CabinetHeader from '@/components/user/CabinetHeader';
import CabinetNav from '@/components/user/CabinetNav';

/**
 * Каркас личного кабинета по макету редизайна: своя шапка (без навигации сайта
 * и подвала), слева меню разделов, справа страница.
 *
 * Сессия проверяется здесь, на сервере: middleware смотрит только наличие куки,
 * а протух ли токен, знает лишь Strapi. Страницы ниже уже могут считать
 * пользователя авторизованным.
 */
/** ЛК у каждого свой — ни страницу, ни её кусок кешировать нельзя. */
export const dynamic = 'force-dynamic';

/** Инициалы для аватара: «Дмитрий Печунка» → «ДП». */
function initialsOf(name: string | null, surname: string | null, email: string): string {
  const letters = [name?.trim()?.[0], surname?.trim()?.[0]].filter(Boolean).join('');
  return (letters || email[0] || '?').toUpperCase();
}

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSession();
  if (!user) redirect('/login');

  const global = await getSingle<Global>('global', {
    locale: strapiLocale(locale),
    query: { populate: '*' },
  });

  const fullName = [user.name, user.surname].filter(Boolean).join(' ') || user.email;

  return (
    <div className="bg-mist min-h-screen">
      <CabinetHeader
        name={fullName}
        initials={initialsOf(user.name, user.surname, user.email)}
        phone={global?.contacts?.phone ?? null}
        email={global?.contacts?.email ?? null}
      />

      <div className="container-page grid items-start gap-6 py-6 lg:grid-cols-[224px_1fr] lg:gap-7 lg:pt-7 lg:pb-[88px]">
        <CabinetNav questionnaireStep={user.stepQuestionare || 1} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
