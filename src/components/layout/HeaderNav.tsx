'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import type { MenuLink } from '@/types/strapi';

/**
 * Верхнее меню: на мобильных раскрывается гамбургером (в старом коде — state
 * showMobileMenu в header.js), активный пункт подсвечивается по первому сегменту URL.
 * Иконка пользователя и кнопка «Заполнить анкету» зависят от того, вошёл ли человек.
 */
export default function HeaderNav({ items }: { items: MenuLink[] }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const section = '/' + (usePathname().split('/')[1] ?? '');
  const { user } = useSession();

  return (
    <>
      {/* на мобильных вместо блока входа — иконка: гостя ведёт в модалку, своего в ЛК */}
      <div className="uk-hidden@s">
        <a
          href={user ? '/user/personal-area' : '#modal-login'}
          uk-toggle={user ? undefined : ''}
          className="userIconMobile"
          aria-label={user ? 'Личный кабинет' : 'Войти'}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            className="svg-inline--fa fa-user fa-w-14"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path
              fill="currentColor"
              d="M313.6 288c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4zM416 464c0 8.8-7.2 16-16 16H48c-8.8 0-16-7.2-16-16v-41.6C32 365.9 77.9 320 134.4 320c19.6 0 39.1 16 89.6 16 50.4 0 70-16 89.6-16 56.5 0 102.4 45.9 102.4 102.4V464zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm0-224c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z"
            />
          </svg>
        </a>
      </div>

      <button
        className={`hamburger header-hamburger hamburger--arrowalt-r uk-hidden@s ${showMobileMenu ? 'is-active' : ''}`}
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        type="button"
        aria-label="Меню"
      >
        <span className="hamburger-box">
          <span className="hamburger-inner" />
        </span>
      </button>

      <nav className={`menu-top ${showMobileMenu ? 'mobile-mnu-is-active' : ''}`}>
        <ul>
          <li className="uk-hidden@s">Меню</li>
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className={section === item.url ? 'nav_active basic_nav' : 'basic_nav'}>
              <Link href={item.url} onClick={() => setShowMobileMenu(false)}>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
          <li
            className={section === '/faq' ? 'nav_active basic_nav' : ''}
            style={user ? { paddingRight: 0 } : undefined}
          >
            <Link
              className="uk-visible@s"
              href="/faq"
              aria-label="Ответы на вопросы"
              title="Ответы на вопросы"
              uk-tooltip="title: Ответы на вопросы; pos: bottom; offset: 20"
            >
              <span className="tm-icons tm-icon-ask" />
            </Link>
            <Link
              className="uk-hidden@s"
              href="/faq"
              onClick={() => setShowMobileMenu(false)}
              title="Ответы на вопросы"
            >
              Ответы на вопросы
            </Link>
          </li>
          {!user ? (
            <li className="menu-call-action">
              <a className="button button-accent" href="#modal-registration" uk-toggle="">
                Заполнить анкету
              </a>
            </li>
          ) : null}
        </ul>
      </nav>
    </>
  );
}
