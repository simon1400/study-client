'use client';

/* eslint-disable @next/next/no-img-element -- SVG-логотип из public/ */
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useSession } from '@/components/auth/SessionProvider';

/**
 * Шапка личного кабинета по макету: логотип, контакты и меню пользователя.
 * Навигации сайта и переключателя языков здесь нет — кабинет живёт отдельно.
 */
export default function CabinetHeader({
  name,
  initials,
  phone,
  email,
}: {
  name: string;
  initials: string;
  phone: string | null;
  email: string | null;
}) {
  const t = useTranslations();
  const { logout } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item =
    'cursor-pointer rounded-[10px] border-0 bg-transparent px-3.5 py-2.5 text-left text-sm font-semibold text-ink transition-colors hover:bg-mist';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-header">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Study in Czech">
          <img src="/logo_ru-blue.svg" alt="Study in Czech" className="h-9 w-auto lg:h-10" />
        </Link>

        <div className="flex items-center gap-4 lg:gap-[22px]">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^+\d]/g, '')}`}
              className="hidden text-sm font-semibold text-ink transition-colors hover:text-blue md:inline"
            >
              {phone}
            </a>
          ) : null}
          {email ? (
            <a
              href={`mailto:${email}`}
              className="hidden text-sm text-muted transition-colors hover:text-blue lg:inline"
            >
              {email}
            </a>
          ) : null}
          <span className="hidden h-6 w-px bg-line lg:block" />

          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex cursor-pointer items-center gap-2.5 rounded-full border-0 bg-transparent p-1.5 transition-colors hover:bg-mist"
            >
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-tint text-[13px] font-bold text-blue">
                {initials}
              </span>
              <span className="hidden text-sm font-semibold text-ink sm:inline">{name}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" className="text-faint">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open ? (
              <div
                role="menu"
                className="shadow-pop absolute top-[54px] right-0 grid w-[220px] gap-0.5 rounded-2xl border border-line bg-white p-2"
              >
                <Link href="/user" className={item} role="menuitem">
                  {t('user.nav.overview')}
                </Link>
                <Link href="/user/questionnaire/step-1" className={item} role="menuitem">
                  {t('user.nav.questionnaire')}
                </Link>
                <Link href="/user/password" className={item} role="menuitem">
                  {t('user.nav.password')}
                </Link>
                <div className="mx-2 my-1 h-px bg-line" />
                <button type="button" className={`${item} !text-muted`} onClick={() => void logout()}>
                  {t('nav.logout')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
