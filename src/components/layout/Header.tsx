import { getTranslations } from 'next-intl/server';
import { getCollection, getSingle } from '@/lib/strapi';
import { strapiLocale } from '@/i18n/routing';
import type { Global, Menu } from '@/types/strapi';
import HeaderClient, { type NavItem } from './HeaderClient';

/**
 * Шапка: данные из Strapi (меню `menu_top` и контакты из `global`), разметка —
 * в клиентском HeaderClient (выпадашки, гамбургер, переключатель языков).
 *
 * Раскладка по макету редизайна: «Главная» + первые три пункта меню видны всегда,
 * остальные уезжают в выпадашку «Ещё» вместе с FAQ и контактами.
 */
export default async function Header({ locale }: { locale: string }) {
  const strapi = strapiLocale(locale);
  const [menus, global, t] = await Promise.all([
    getCollection<Menu>('menus', {
      locale: strapi,
      query: { filters: { location: { $eq: 'menu_top' } }, sort: ['location:asc'], populate: '*' },
    }),
    getSingle<Global>('global', { locale: strapi, query: { populate: '*' } }),
    getTranslations({ locale }),
  ]);

  const items = menus[0]?.items ?? [];

  const main: NavItem[] = [{ id: 'home', title: t('nav.home'), url: '/' }, ...items.slice(0, 3)];

  const more: NavItem[] = [
    ...items.slice(3),
    { id: 'faq', title: t('common.faq'), url: '/faq' },
    { id: 'contacts', title: t('nav.contacts'), url: '/contacts' },
  ].filter(
    // если такой адрес уже есть в меню Strapi — не дублируем
    (item, index, all) => all.findIndex((other) => other.url === item.url) === index
  );

  return <HeaderClient locale={locale} main={main} more={more} phone={global?.contacts?.phone ?? null} />;
}
