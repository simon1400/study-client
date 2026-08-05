/* eslint-disable @next/next/no-img-element -- статика из public/, размеры задаёт SCSS */
import { Link } from '@/i18n/navigation';
import { getCollection, getSingle } from '@/lib/strapi';
import { strapiLocale } from '@/i18n/routing';
import type { Global, Menu } from '@/types/strapi';
import HeaderNav from './HeaderNav';

// TODO (этап 5): блок авторизации — «Войти», выпадашка личного кабинета,
// модалки регистрации/пароля. Публичные страницы этапа 4 их не используют.

export default async function Header({ locale }: { locale: string }) {
  const strapi = strapiLocale(locale);
  const [menus, global] = await Promise.all([
    getCollection<Menu>('menus', {
      locale: strapi,
      query: { filters: { location: { $eq: 'menu_top' } }, sort: ['location:asc'], populate: '*' },
    }),
    getSingle<Global>('global', { locale: strapi, query: { populate: '*' } }),
  ]);

  const items = menus[0]?.items ?? [];
  const contacts = global?.contacts;

  return (
    <header>
      <div className="header-top">
        <div className="uk-container uk-flex uk-flex-between uk-flex-wrap">
          <Link href="/" className="logo">
            <img src="/logo_ru.svg" alt="Logo" />
          </Link>

          <HeaderNav items={items} />
        </div>
      </div>

      <div className="header_bottom uk-visible@s">
        <div className="uk-container ">
          <div className="uk-grid">
            <div className="uk-width-2-3@s">
              {contacts?.phone ? (
                <a href={`tel:${contacts.phone}`} className="contact-info-top">
                  <span className="tm-icons tm-icon-phone" />
                  {contacts.phone}
                </a>
              ) : null}
              {contacts?.email ? (
                <a href={`mailto:${contacts.email}`} className="contact-info-top">
                  <span className="tm-icons tm-icon-envelope" />
                  {contacts.email}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
