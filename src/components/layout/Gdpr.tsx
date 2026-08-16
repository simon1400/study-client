'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { saveConsent, storedConsent } from '@/lib/analytics';

/** Плашка cookies по макету главной: плавающая полоса внизу по центру. */
export default function Gdpr() {
  const t = useTranslations('gdpr');
  // до чтения localStorage баннер не показываем, чтобы не мигал при гидрации
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (storedConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function decide(granted: boolean) {
    saveConsent(granted);
    setVisible(false);
  }

  return (
    <div className="shadow-bar fixed bottom-4 left-1/2 z-60 flex w-[calc(100%-32px)] max-w-[640px] -translate-x-1/2 flex-col items-center gap-3 rounded-2xl bg-white px-5 py-4 sm:w-auto sm:flex-row sm:gap-[18px] sm:px-6">
      <span className="text-body text-center text-sm sm:text-left">
        {t('text')}{' '}
        <Link href="/privacy" className="text-blue hover:text-blue-dark underline underline-offset-2">
          {t('more')}
        </Link>
      </span>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => decide(true)}
          className="bg-blue hover:bg-blue-dark cursor-pointer rounded-full border-0 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {t('accept')}
        </button>
        <button
          type="button"
          onClick={() => decide(false)}
          className="text-muted hover:border-faint cursor-pointer rounded-full border border-border bg-transparent px-5 py-2.5 text-sm"
        >
          {t('decline')}
        </button>
      </div>
    </div>
  );
}
