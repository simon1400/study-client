'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { STEP_ORDER, STEP_TITLE_KEYS } from '@/lib/questionnaire';

/**
 * Правая колонка анкеты: список шагов с галочками у заполненных (макет «Анкета»).
 * Нумерация здесь — позиции интерфейса, а не ключи хранения в Strapi.
 */
export default function QuestionnaireNav({
  position,
  filled,
  supportEmail,
  supportPhone,
}: {
  position: number;
  /** Сколько шагов уже заполнено — по ним ставятся галочки. */
  filled: number;
  supportEmail: string;
  supportPhone: string | null;
}) {
  const t = useTranslations();

  return (
    <div className="grid gap-5 lg:sticky lg:top-24">
      <nav className="rounded-card grid gap-0.5 border border-line bg-white p-2.5">
        {STEP_ORDER.map((storage, index) => {
          const number = index + 1;
          const current = number === position;
          const done = number <= filled;

          return (
            <Link
              key={storage}
              href={`/user/questionnaire/step-${number}`}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                current ? 'bg-tint' : 'hover:bg-mist'
              }`}
            >
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-blue text-white'
                    : current
                      ? 'bg-ink text-white'
                      : 'bg-mist text-faint border border-line'
                }`}
              >
                {done ? '✓' : number}
              </span>
              <span
                className={`text-sm font-semibold ${current ? 'text-blue' : done ? 'text-ink' : 'text-muted'}`}
              >
                {t(`user.steps.${STEP_TITLE_KEYS[storage]}`)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-card border border-line bg-white px-5 py-5">
        <div className="text-sm font-bold text-ink">{t('user.questionnaire.helpTitle')}</div>
        <p className="text-muted mt-1.5 mb-0 text-[13px]">
          {t('user.questionnaire.helpText')}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-[13px] font-semibold">
          <a href={`mailto:${supportEmail}`} className="text-blue hover:text-blue-dark">
            {supportEmail}
          </a>
          {supportPhone ? (
            <a
              href={`tel:${supportPhone.replace(/[^+\d]/g, '')}`}
              className="text-blue hover:text-blue-dark"
            >
              {supportPhone}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
