/* eslint-disable @next/next/no-img-element -- статика из public/, размеры задаёт класс */
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCollection, getSingle } from '@/lib/strapi';
import { strapiLocale } from '@/i18n/routing';
import type { Global, InfoPage, Menu } from '@/types/strapi';
import Gdpr from './Gdpr';

const SOC = [
  { key: 'facebook', icon: '/facebook-f-brands.svg', label: 'Facebook' },
  { key: 'vkontakte', icon: '/vk-brands.svg', label: 'VK' },
  { key: 'instagram', icon: '/instagram-brands.svg', label: 'Instagram' },
] as const;

/** Подвал редизайна: тёмная секция Ink, три колонки меню из Strapi и соцсети. */
export default async function Footer({ locale }: { locale: string }) {
  const strapi = strapiLocale(locale);
  const [menus, global, pages, t] = await Promise.all([
    getCollection<Menu>('menus', {
      locale: strapi,
      query: {
        filters: { location: { $in: ['menu_footer_1', 'menu_footer_2', 'menu_footer_3'] } },
        sort: ['location:asc'],
        populate: '*',
      },
    }),
    getSingle<Global>('global', { locale: strapi, query: { populate: '*' } }),
    getCollection<InfoPage>('pages', {
      locale: strapi,
      query: { fields: ['title', 'slug', 'showInFooter', 'order'] },
    }),
    getTranslations({ locale }),
  ]);

  const socLinks = global?.socLinks;
  const contacts = global?.contacts;

  /**
   * Технические страницы (коллекция `page`) с галочкой «Показывать в подвале» —
   * дописываются в последнюю колонку меню. Так редактор добавляет оферту или
   * условия из админки, не трогая ни меню, ни код.
   */
  const footerPages = pages
    .filter((page) => page.showInFooter)
    .filter((page) => !menus.some((menu) => menu.items.some((item) => item.url === `/${page.slug}`)))
    .map((page) => ({ id: `page-${page.id}`, title: page.title, url: `/${page.slug}` }));

  return (
    <>
      <footer className="bg-ink text-on-ink">
        <div className="container-page grid gap-10 pt-12 md:grid-cols-2 md:pt-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex" aria-label="Study in Czech">
              <img src="/logo_ru-white.svg" alt="Study in Czech" className="h-[46px] w-auto" />
            </Link>
            <p className="mt-4 max-w-[260px] text-sm">{t('footer.tagline')}</p>
            {contacts?.phone || contacts?.email ? (
              <div className="mt-4 flex flex-col gap-2 text-sm">
                {contacts?.phone ? (
                  <a
                    href={`tel:${contacts.phone.replace(/[^+\d]/g, '')}`}
                    className="text-on-ink transition-colors hover:text-white"
                  >
                    {contacts.phone}
                  </a>
                ) : null}
                {contacts?.email ? (
                  <a href={`mailto:${contacts.email}`} className="text-on-ink transition-colors hover:text-white">
                    {contacts.email}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {menus.map((menu, index) => {
            const items: Array<{ id: number | string; title: string; url: string }> =
              index === menus.length - 1 ? [...menu.items, ...footerPages] : menu.items;
            return (
              <div key={menu.id}>
                <div className="mb-4 text-sm font-semibold text-white md:mb-[18px]">{menu.title}</div>
                <div className="flex flex-col gap-2.5 text-sm">
                  {items.map((item) => (
                    <a key={item.id} href={item.url} className="text-on-ink transition-colors hover:text-white">
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="container-page mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 py-5 md:mt-11">
          <div className="text-on-ink-faint text-sm">
            © {new Date().getFullYear()} Study in Czech. {t('footer.rights')}
          </div>
          <div className="flex items-center gap-2.5">
            {SOC.map(({ key, icon, label }) => {
              const url = socLinks?.[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-white/8 transition-colors hover:bg-white/15"
                >
                  <img src={icon} alt="" className="h-[15px] w-auto invert" />
                </a>
              );
            })}
          </div>
        </div>
      </footer>
      <Gdpr />
    </>
  );
}
