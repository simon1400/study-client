/* eslint-disable @next/next/no-img-element -- статика из public/, размеры задаёт SCSS */
import { getCollection, getSingle } from '@/lib/strapi';
import { strapiLocale } from '@/i18n/routing';
import type { Global, Menu } from '@/types/strapi';
import Gdpr from './Gdpr';

const SOC = [
  { key: 'facebook', icon: '/facebook-f-brands.svg' },
  { key: 'vkontakte', icon: '/vk-brands.svg' },
  { key: 'instagram', icon: '/instagram-brands.svg' },
] as const;

export default async function Footer({ locale }: { locale: string }) {
  const strapi = strapiLocale(locale);
  const [menus, global] = await Promise.all([
    getCollection<Menu>('menus', {
      locale: strapi,
      query: {
        filters: { location: { $in: ['menu_footer_1', 'menu_footer_2', 'menu_footer_3'] } },
        sort: ['location:asc'],
        populate: '*',
      },
    }),
    getSingle<Global>('global', { locale: strapi, query: { populate: '*' } }),
  ]);

  const socLinks = global?.socLinks;

  return (
    <>
      <footer>
        <div className="footer-top">
          <div className="uk-container ">
            <div className="uk-grid uk-child-width-1-4@m uk-child-width-1-2@s uk-child-width-1-1">
              <div>
                <div className="footer_contact">
                  <img src="/logo_ru.svg" alt="" />
                  <p>Мы в соцсетях:</p>
                  <ul>
                    {SOC.map(({ key, icon }) => {
                      const url = socLinks?.[key];
                      if (!url) return null;
                      return (
                        <li key={key}>
                          <a href={url} target="_blank" rel="noreferrer noopener">
                            <img src={icon} alt={key} />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              {menus.map((menu) => (
                <div key={menu.id}>
                  <ul>
                    <li className="footer-head">{menu.title}</li>
                    {menu.items.map((item) => (
                      <li key={item.id}>
                        <a href={item.url}>{item.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="uk-container ">
            <div className="uk-grid uk-child-width-1-2@s uk-child-width-1-1">
              <div>
                <div className="copyright">© {new Date().getFullYear()} Все права защищены.</div>
              </div>
              <div>
                <div className="pay-method uk-text-right@s">
                  <ul>
                    <li>
                      <img src="/Visa.png" alt="" />
                    </li>
                    <li>
                      <img src="/Maestro.png" alt="" />
                    </li>
                    <li>
                      <img src="/Mastercard.png" alt="" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <Gdpr />
    </>
  );
}
