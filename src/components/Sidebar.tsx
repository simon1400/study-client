import { getCollection } from '@/lib/strapi';
import { strapiLocale } from '@/i18n/routing';
import type { Menu } from '@/types/strapi';
import SidebarNav from './SidebarNav';

/** Боковое меню разделов (menu location=sidebar) — общее для списков и деталок. */
export default async function Sidebar({ locale }: { locale: string }) {
  const menus = await getCollection<Menu>('menus', {
    locale: strapiLocale(locale),
    query: { filters: { location: { $eq: 'sidebar' } }, populate: '*', sort: ['location:asc'] },
  });

  return <SidebarNav items={menus[0]?.items ?? []} />;
}
