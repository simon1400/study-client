'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_LABELS, routing, type Locale } from '@/i18n/routing';

/**
 * Переключатель языков из шапки редизайна. Ведёт на тот же адрес в другой локали:
 * `usePathname` из next-intl отдаёт путь уже без префикса, поэтому `replace`
 * подставляет нужный (`ru` — без префикса, остальные — /uk, /cz, /en).
 * Динамические сегменты ([slug], [step]) передаются через `params` — slug'и в Strapi
 * нелокализованы, так что адрес статьи в другой локали тот же.
 */
export default function LangSwitcher({
  current,
  variant = 'desktop',
  onNavigate,
}: {
  current: string;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    onNavigate?.();
    // usePathname из next-intl отдаёт уже раскрытый путь без префикса локали
    // (/blog/moya-statya), поэтому подставить нужно только сам префикс.
    startTransition(() => router.replace(pathname, { locale }));
  }

  if (variant === 'mobile') {
    return (
      <div className="flex gap-2" aria-busy={pending}>
        {routing.locales.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            aria-current={locale === current ? 'true' : undefined}
            className={`flex-1 rounded-full border px-0 py-2.5 text-sm font-semibold transition-colors ${
              locale === current
                ? 'border-blue bg-blue text-white'
                : 'border-border bg-white text-body hover:border-blue'
            }`}
          >
            {LOCALE_LABELS[locale].short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="group relative" aria-busy={pending}>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-transparent px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-blue"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        {LOCALE_LABELS[current as Locale]?.short ?? current.toUpperCase()}
        <Chevron />
      </button>

      {/* раскрывается по наведению и по фокусу с клавиатуры — без внешнего состояния */}
      <div className="invisible absolute top-full right-0 z-50 min-w-[160px] translate-y-1 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="shadow-pop flex flex-col rounded-[14px] border border-line bg-white p-2">
          {routing.locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => switchTo(locale)}
              aria-current={locale === current ? 'true' : undefined}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-mist hover:text-ink ${
                locale === current ? 'font-semibold text-ink' : 'text-body'
              }`}
            >
              {LOCALE_LABELS[locale].full}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg width="9" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" className="text-faint">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
