'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useSession } from '@/components/auth/SessionProvider';

/**
 * Левое меню кабинета (макет «Кабинет»): пять разделов и выход.
 * На узких экранах превращается в горизонтальную ленту — мобильной версии
 * кабинета в макете нет, а прятать навигацию под бургер здесь избыточно.
 */
export default function CabinetNav({ questionnaireStep }: { questionnaireStep: number }) {
  const t = useTranslations();
  const { logout } = useSession();
  const pathname = usePathname();

  const items = [
    { href: '/user', label: t('user.nav.overview'), exact: true },
    {
      href: `/user/questionnaire/step-${questionnaireStep}`,
      label: t('user.nav.questionnaire'),
      match: '/user/questionnaire',
    },
    { href: '/user/contract', label: t('user.nav.contract') },
    { href: '/user/payment', label: t('user.nav.payment') },
    { href: '/user/password', label: t('user.nav.password') },
  ];

  const isActive = (item: (typeof items)[number]) =>
    item.exact ? pathname === '/user' : pathname.startsWith(item.match ?? item.href);

  return (
    <nav className="rounded-card grid gap-0.5 border border-line bg-white p-2.5 lg:sticky lg:top-24">
      <div className="flex gap-0.5 overflow-x-auto lg:grid lg:overflow-visible">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive(item) ? 'bg-tint text-blue' : 'text-body hover:bg-mist'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mx-2.5 my-1.5 hidden h-px bg-line lg:block" />
      <button
        type="button"
        onClick={() => void logout()}
        className="hidden w-full cursor-pointer rounded-xl border-0 bg-transparent px-4 py-3 text-left text-sm font-semibold text-faint transition-colors hover:text-ink lg:block"
      >
        {t('nav.logout')}
      </button>
    </nav>
  );
}
