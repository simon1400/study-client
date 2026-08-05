'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import type { MenuLink } from '@/types/strapi';

/**
 * Верхнее меню: на мобильных раскрывается гамбургером (в старом коде — state
 * showMobileMenu в header.js), активный пункт подсвечивается по первому сегменту URL.
 */
export default function HeaderNav({ items }: { items: MenuLink[] }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const section = '/' + (usePathname().split('/')[1] ?? '');

  return (
    <>
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
          <li className={section === '/faq' ? 'nav_active basic_nav' : ''}>
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
        </ul>
      </nav>
    </>
  );
}
