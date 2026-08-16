'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { QUESTIONNAIRE_STEPS } from '@/lib/cabinet';

/**
 * Общая обвязка форм анкеты в стиле редизайна: сетка полей, нижняя панель
 * с «Назад» и «Сохранить», управление повторяемыми блоками.
 */

/** Сетка полей шага: две колонки на десктопе, одна на мобильных. */
export function StepGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 md:gap-x-5">{children}</div>;
}

/**
 * Низ карточки шага. «Назад» ведёт на предыдущую позицию анкеты,
 * основная кнопка сохраняет и уводит дальше (на последнем шаге — в обзор).
 */
export function StepFooter({
  position,
  onSave,
  saving,
  error,
}: {
  position: number;
  onSave: () => void;
  saving: boolean;
  error: boolean;
}) {
  const t = useTranslations('user.questionnaire');

  return (
    <div className="-mx-6 mt-8 border-t border-line px-6 pt-5 md:-mx-8 md:px-8">
      {error ? <p className="field-message mb-3">{t('saveError')}</p> : null}
      <div className="flex items-center gap-3">
        {position > 1 ? (
          <Link
            href={`/user/questionnaire/step-${position - 1}`}
            className="btn btn-ghost !border !px-6 !py-3 !text-[15px]"
          >
            {t('back')}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn btn-secondary ml-auto !px-7 !py-3 !text-[15px]"
        >
          {saving ? '…' : position === QUESTIONNAIRE_STEPS ? t('finish') : t('next')}
        </button>
      </div>
    </div>
  );
}

/** «Добавить» / «Удалить» под повторяемым блоком (братья, сёстры, учебные заведения). */
export function ButtonControl({
  count,
  onAdd,
  onRemove,
  addLabel,
}: {
  count: number;
  onAdd: () => void;
  onRemove: () => void;
  addLabel?: string;
}) {
  const t = useTranslations('user.questionnaire');

  return (
    <div className="flex flex-wrap gap-2.5 md:col-span-2">
      <button
        type="button"
        onClick={onAdd}
        className="hover:border-blue text-blue h-[42px] cursor-pointer rounded-full border border-dashed border-border bg-white px-5 text-sm font-semibold"
      >
        + {addLabel ?? t('add')}
      </button>
      {count ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-faint hover:text-blue h-[42px] cursor-pointer rounded-full border-0 bg-transparent px-3 text-sm font-semibold"
        >
          {t('remove')}
        </button>
      ) : null}
    </div>
  );
}
