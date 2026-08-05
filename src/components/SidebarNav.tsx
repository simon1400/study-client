'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import type { MenuLink } from '@/types/strapi';
import '@/styles/sidebar-collapse.scss';

export default function SidebarNav({ items }: { items: MenuLink[] }) {
  // на десктопе меню всегда развёрнуто, на мобильных — по кнопке «Разделы»
  const [show, setShow] = useState(false);
  const section = '/' + (usePathname().split('/')[1] ?? '');

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
              {items.map((item) => (
                <li key={item.id} className={section === item.url ? 'nav_active' : ''}>
                  <Link href={item.url}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
