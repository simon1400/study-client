'use client';

/* eslint-disable @next/next/no-img-element -- SVG-логотип из public/, размеры задаёт класс */
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import { useRegistration } from '@/components/auth/RegistrationProvider';
import LangSwitcher from './LangSwitcher';

export type NavItem = { id: number | string; title: string; url: string };

/**
 * Шапка редизайна: логотип, 4 основных пункта, выпадашка «Ещё», переключатель
 * языков, телефон и жёлтый CTA. На ширине < lg всё уезжает под гамбургер
 * (макет «Главная — мобильная»).
 */
export default function HeaderClient({
  locale,
  main,
  more,
  phone,
}: {
  locale: string;
  main: NavItem[];
  more: NavItem[];
  phone: string | null;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const { user } = useSession();
  const [openMore, setOpenMore] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const registration = useRegistration();
  const moreRef = useRef<HTMLDivElement>(null);

  const section = '/' + (pathname.split('/')[1] ?? '');
  const isActive = (url: string) => url === section || (url === '/' && section === '/');
  const moreActive = more.some((i) => isActive(i.url));

  // закрыть выпадашку кликом снаружи и по Escape
  useEffect(() => {
    if (!openMore) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setOpenMore(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMore(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMore]);

  // мобильное меню закрывается при переходе на другую страницу
  useEffect(() => {
    setOpenMenu(false);
    setOpenMore(false);
  }, [pathname]);

  const ctaHref = user ? `/user/questionnaire/step-${user.stepQuestionare ?? 1}` : null;

  const cta = ctaHref ? (
    <Link href={ctaHref} className="btn btn-primary !px-5 !py-2.5 !text-sm">
      {t('cta.form')}
    </Link>
  ) : (
    <button type="button" onClick={registration.open} className="btn btn-primary !px-5 !py-2.5 !text-sm">
      {t('cta.form')}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/94 backdrop-blur-[12px]">
      <div className="container-page flex h-16 items-center justify-between gap-7 lg:h-header">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Study in Czech">
          <img src="/logo_ru-blue.svg" alt="Study in Czech" className="h-[38px] w-auto lg:h-11" />
        </Link>

        {/* --- десктоп --- */}
        <nav className="hidden items-center gap-[26px] lg:flex">
          {main.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className={`text-[15px] whitespace-nowrap transition-colors hover:text-ink ${
                isActive(item.url) ? 'font-semibold text-ink' : 'text-body'
              }`}
            >
              {item.title}
            </Link>
          ))}

          {more.length > 0 ? (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setOpenMore((v) => !v)}
                aria-expanded={openMore}
                aria-haspopup="menu"
                className={`flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[15px] transition-colors hover:text-ink ${
                  moreActive ? 'font-semibold text-ink' : 'text-body'
                }`}
              >
                {t('common.more')}
                <Chevron open={openMore} />
              </button>

              {openMore ? (
                <div
                  role="menu"
                  className="shadow-pop absolute top-8 -left-3 flex min-w-[230px] flex-col rounded-2xl border border-line bg-white p-2.5"
                >
                  {more.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      role="menuitem"
                      className={`rounded-[10px] px-3.5 py-2.5 text-[15px] whitespace-nowrap transition-colors hover:bg-mist hover:text-ink ${
                        isActive(item.url) ? 'font-semibold text-ink' : 'text-body'
                      }`}
                    >
                      {item.title}
                    </Link>
                  ))}
                  <AccountLinks />
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <LangSwitcher current={locale} />
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^+\d]/g, '')}`}
              className="text-sm font-semibold whitespace-nowrap text-ink transition-colors hover:text-blue"
            >
              {phone}
            </a>
          ) : null}
          {cta}
        </div>

        {/* --- мобильные --- */}
        <div className="flex items-center gap-3 lg:hidden">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^+\d]/g, '')}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-tint text-blue"
              aria-label={t('nav.callUs')}
            >
              <PhoneIcon />
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => setOpenMenu((v) => !v)}
            aria-expanded={openMenu}
            aria-label={t('common.menu')}
            className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-xl border border-line bg-white"
          >
            <span className="h-0.5 w-[18px] rounded-sm bg-ink" />
            <span className="h-0.5 w-[18px] rounded-sm bg-ink" />
            <span className={`h-0.5 rounded-sm bg-ink transition-all ${openMenu ? 'w-[18px]' : 'w-3 self-end mr-[13px]'}`} />
          </button>
        </div>
      </div>

      {openMenu ? (
        <div className="border-t border-line bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {[...main, ...more].map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className={`rounded-xl px-3 py-3 text-[15px] transition-colors hover:bg-mist ${
                  isActive(item.url) ? 'font-semibold text-ink' : 'text-body'
                }`}
              >
                {item.title}
              </Link>
            ))}
            <div className="flex flex-col gap-1 border-t border-line pt-3">
              <AccountLinks mobile />
            </div>
            <div className="mt-3">
              <LangSwitcher current={locale} variant="mobile" onNavigate={() => setOpenMenu(false)} />
            </div>
            <div className="mt-3">
              {ctaHref ? (
                <Link href={ctaHref} className="btn btn-primary btn-block">
                  {t('cta.form')}
                </Link>
              ) : (
                <button type="button" onClick={registration.open} className="btn btn-primary btn-block">
                  {t('cta.form')}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Вход / личный кабинет — общий кусок для выпадашки «Ещё» и мобильного меню. */
function AccountLinks({ mobile = false }: { mobile?: boolean }) {
  const t = useTranslations();
  const { user, loading, logout } = useSession();
  const cls = mobile
    ? 'rounded-xl px-3 py-3 text-left text-[15px] text-body transition-colors hover:bg-mist'
    : 'rounded-[10px] px-3.5 py-2.5 text-left text-[15px] whitespace-nowrap text-body transition-colors hover:bg-mist hover:text-ink';

  if (loading) return null;

  if (!user) {
    // вход в редизайне — отдельная страница, а не модалка
    return (
      <Link href="/login" className={cls}>
        {t('nav.login')}
      </Link>
    );
  }

  return (
    <>
      <Link href="/user/personal-area" className={cls}>
        {t('nav.account')}
      </Link>
      <Link href={`/user/questionnaire/step-${user.stepQuestionare ?? 1}`} className={cls}>
        {t('nav.questionnaire')}
      </Link>
      <button type="button" className={`${cls} cursor-pointer border-0 bg-transparent`} onClick={() => void logout()}>
        {t('nav.logout')}
      </button>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
