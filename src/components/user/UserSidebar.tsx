'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import LinkButton from '@/components/auth/LinkButton';
import { showModal } from '@/lib/uikit';
import '@/styles/sidebar-collapse.scss';

/**
 * Левое меню личного кабинета (старый `routes/user/components/sidebar`).
 * На мобильных сворачивается; раскрытие — на CSS вместо react-animate-height,
 * как это уже сделано в аккордеонах публичных страниц.
 */
export default function UserSidebar({ stepQuestionare }: { stepQuestionare: number }) {
  const { logout } = useSession();
  const section = usePathname().split('/')[2];
  const [show, setShow] = useState(false);

  // на десктопе меню всегда раскрыто; определяем ширину после монтирования,
  // чтобы разметка на сервере и на клиенте совпадала
  useEffect(() => {
    if (window.innerWidth >= 640) setShow(true);
  }, []);

  return (
    <>
      <div
        onClick={() => setShow(!show)}
        className="sidebar_btn_wrap uk-flex uk-flex-left uk-flex-middle uk-hidden@s"
      >
        <button className={`hamburger hamburger--spring uk-hidden@s ${show ? 'is-active' : ''}`} type="button">
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>
        <span>Разделы</span>
      </div>

      <div className={`sidebar-collapse ${show ? 'is-open' : ''}`}>
        <div>
          <nav className="sidebar">
            <ul>
              <li className={section === 'personal-area' ? 'nav_active' : ''}>
                <Link href="/user/personal-area">Личный кабинет</Link>
              </li>
              <li className={section === 'questionnaire' ? 'nav_active' : ''}>
                <Link href={`/user/questionnaire/step-${stepQuestionare}`}>Анкета</Link>
              </li>
              <li>
                <LinkButton onClick={() => showModal('#modal-password')}>Изменить пароль</LinkButton>
              </li>
              <li>
                <LinkButton onClick={() => void logout()}>Выйти</LinkButton>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
