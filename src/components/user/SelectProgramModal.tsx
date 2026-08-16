'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export type ProgramOption = {
  title: string;
  price: string;
  /** Дата начала курса — уезжает в карточку пользователя, как на старом сайте. */
  dateCourse: string;
  /** Город: в макете программы сгруппированы, у нас группа — это город из CMS. */
  group: string | null;
};

/**
 * Модалка выбора программы (макет «Кабинет → Выбор программы»).
 *
 * Своя разметка вместо UIkit-модалки: кабинет в редизайне не тянет UIkit,
 * а прежняя модалка переносилась им в <body> и роняла React при уходе со страницы.
 */
export default function SelectProgramModal({
  programs,
  selected,
  open,
  onClose,
}: {
  programs: ProgramOption[];
  selected: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [temp, setTemp] = useState<ProgramOption | null>(
    programs.find((p) => p.title === selected) ?? null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  if (!open) return null;

  const groups = programs.reduce<Array<{ title: string | null; items: ProgramOption[] }>>((acc, item) => {
    const last = acc[acc.length - 1];
    if (last && last.title === item.group) last.items.push(item);
    else acc.push({ title: item.group, items: [item] });
    return acc;
  }, []);

  async function confirm() {
    if (!temp) return;
    setSaving(true);
    setError(false);
    try {
      const res = await fetch('/api/account/program', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programm: temp.title, price: temp.price, dateCourse: temp.dateCourse }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onClose();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="bg-ink/55 fixed inset-0 z-70 flex items-center justify-center overflow-auto p-5 md:p-8"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rounded-panel flex max-h-[84vh] w-full max-w-[620px] flex-col overflow-hidden bg-white shadow-[0_24px_64px_rgba(11,14,44,.3)]">
        <div className="flex items-center justify-between border-b border-line px-6 py-5 md:px-7">
          <div className="font-display text-lg font-semibold text-ink">{t('user.program.title')}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-line bg-white text-[15px] text-muted transition-colors hover:border-blue hover:text-blue"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5 md:px-7">
          {groups.map((group, index) => (
            <div key={group.title ?? index} className={index ? 'mt-6' : ''}>
              {group.title ? (
                <div className="mb-2.5 text-xs font-bold tracking-[0.08em] text-faint uppercase">
                  {group.title}
                </div>
              ) : null}
              <div className="grid gap-2">
                {group.items.map((item) => {
                  const active = temp?.title === item.title;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setTemp(item)}
                      className={`flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                        active ? 'border-blue bg-tint' : 'border-line bg-white hover:border-border'
                      }`}
                    >
                      <span
                        className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                          active ? 'border-[6px] border-blue' : 'border-border'
                        }`}
                      />
                      <span className="flex-1 text-[15px] font-semibold text-ink">{item.title}</span>
                      <span className="text-[15px] font-bold whitespace-nowrap text-ink">
                        {item.price || t('common.onRequest')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4 md:px-7">
          {error ? <span className="field-message">{t('user.contract.signError')}</span> : <span />}
          <div className="flex gap-3">
            <button type="button" className="btn btn-ghost !border !py-3 !text-[15px]" onClick={onClose}>
              {t('user.program.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary !py-3 !text-[15px]"
              disabled={!temp || saving}
              onClick={confirm}
            >
              {t('user.program.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
