import { redirect } from 'next/navigation';
import { getSession } from '@/lib/account';
import UserSidebar from '@/components/user/UserSidebar';
import CallModal from '@/components/modals/CallModal';
import '@/styles/legacy/user.scss';

/**
 * Каркас личного кабинета: слева меню разделов, справа — страница.
 * Разметка из старого `routes/user/index.js`.
 *
 * Сессия проверяется здесь, на сервере: middleware смотрит только наличие куки,
 * а протух ли токен, знает лишь Strapi. Страницы ниже уже могут считать
 * пользователя авторизованным.
 */
/** ЛК у каждого свой — ни страницу, ни её кусок кешировать нельзя. */
export const dynamic = 'force-dynamic';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/');

  return (
    <main className="userArea">
      <div className="uk-container">
        <div className="uk-flex uk-flex-between uk-flex-top">
          <div className="sidebar_wrap">
            <UserSidebar stepQuestionare={user.stepQuestionare} />
          </div>
          {children}
        </div>
      </div>
      {/* оба сайдбара ЛК ссылаются на #modal-call */}
      <CallModal />
    </main>
  );
}
