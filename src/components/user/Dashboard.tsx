'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cabinetProgress, formatDate, formatMoney } from '@/lib/cabinet';
import type { AccountUser } from '@/types/account';
import SelectProgramModal, { type ProgramOption } from './SelectProgramModal';

/**
 * Обзор кабинета: четыре шага пути студента с прогрессом (макет «Дашборд»).
 * Клиентский компонент — из-за модалки выбора программы; данные приходят с сервера.
 */
export default function Dashboard({
  user,
  programs,
  locale,
  prepayPercent,
  supportEmail,
  supportPhone,
}: {
  user: AccountUser;
  programs: ProgramOption[];
  locale: string;
  prepayPercent: number;
  supportEmail: string;
  supportPhone: string | null;
}) {
  const t = useTranslations();
  const [programOpen, setProgramOpen] = useState(false);
  const progress = cabinetProgress(user);

  const prepay = user.priceAmount != null ? Math.round((user.priceAmount * prepayPercent) / 100) : null;
  const prepayLabel = formatMoney(prepay, user.priceCurrency);
  const priceLabel = formatMoney(user.priceAmount, user.priceCurrency) ?? user.price;

  const steps = [
    {
      key: 'program' as const,
      title: t('user.dashboard.stepProgram'),
      desc: progress.program
        ? [user.programm, priceLabel].filter(Boolean).join(' · ')
        : t('user.dashboard.stepProgramEmpty'),
      done: progress.program,
      cta: t('user.dashboard.stepProgramCta'),
      onClick: () => setProgramOpen(true),
      href: null,
    },
    {
      key: 'questionnaire' as const,
      title: t('user.dashboard.stepQuestionnaire'),
      desc: progress.questionnaire
        ? t('user.dashboard.stepQuestionnaireDone')
        : progress.questionnaireDone
          ? t('user.dashboard.stepQuestionnairePart', { done: progress.questionnaireDone })
          : t('user.dashboard.stepQuestionnaireEmpty'),
      done: progress.questionnaire,
      cta: progress.questionnaireDone
        ? t('user.dashboard.stepQuestionnaireContinue')
        : t('user.dashboard.stepQuestionnaireCta'),
      onClick: null,
      href: `/user/questionnaire/step-${user.stepQuestionare || 1}`,
    },
    {
      key: 'contract' as const,
      title: t('user.dashboard.stepContract'),
      desc: progress.contract
        ? t('user.dashboard.stepContractDone', {
            date: formatDate(user.contractSignedAt, locale) ?? '',
          })
        : t('user.dashboard.stepContractEmpty'),
      done: progress.contract,
      cta: t('user.dashboard.stepContractCta'),
      onClick: null,
      href: '/user/contract',
    },
    {
      key: 'payment' as const,
      title: t('user.dashboard.stepPayment'),
      desc: progress.payment
        ? t('user.dashboard.stepPaymentDone')
        : progress.paymentPending
          ? t('user.dashboard.stepPaymentPending')
          : prepayLabel
            ? t('user.dashboard.stepPaymentReady', { percent: prepayPercent, amount: prepayLabel })
            : t('user.dashboard.stepPaymentEmpty'),
      done: progress.payment,
      cta: t('user.dashboard.stepPaymentCta'),
      onClick: null,
      href: '/user/payment',
    },
  ];

  const percent = Math.max(Math.round((progress.done / progress.total) * 100), 3);
  const fullName = [user.name, user.surname].filter(Boolean).join(' ') || user.email;

  return (
    <>
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_312px]">
        <section className="rounded-panel border border-line bg-white p-6 md:px-8 md:py-[30px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display m-0 text-[20px] font-semibold text-ink md:text-[22px]">
              {t('user.dashboard.greeting', { name: user.name || fullName })}
            </h1>
            <span className="badge !font-bold">
              {t('user.dashboard.progress', { done: progress.done, total: progress.total })}
            </span>
          </div>
          <p className="text-muted mt-2 mb-5 text-sm">{t('user.dashboard.lead')}</p>

          <div className="bg-tint h-2 overflow-hidden rounded-full">
            <div className="bg-blue h-2 rounded-full transition-[width]" style={{ width: `${percent}%` }} />
          </div>

          <div className="mt-6 grid gap-2.5">
            {steps.map((step, index) => {
              const active = progress.next === step.key;
              const body = (
                <>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
                      step.done
                        ? 'bg-blue text-white'
                        : active
                          ? 'bg-yellow text-ink'
                          : 'bg-tint text-faint'
                    }`}
                  >
                    {step.done ? '✓' : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-base font-semibold ${step.done || active ? 'text-ink' : 'text-faint'}`}
                    >
                      {step.title}
                    </span>
                    <span className="text-muted mt-0.5 block text-[13px]">{step.desc}</span>
                  </span>
                  {active ? (
                    <span className="btn btn-primary !h-[42px] !px-5 !py-0 !text-sm">{step.cta}</span>
                  ) : (
                    <span className="text-border text-lg">›</span>
                  )}
                </>
              );

              const cls =
                'flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-4 text-left transition-colors hover:border-border md:px-[18px]';

              return step.href ? (
                <Link key={step.key} href={step.href} className={cls}>
                  {body}
                </Link>
              ) : (
                <button key={step.key} type="button" onClick={step.onClick ?? undefined} className={`${cls} w-full cursor-pointer`}>
                  {body}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="grid gap-5">
          <div className="rounded-card border border-line bg-white p-6">
            <div className="flex items-center gap-3.5">
              <span className="bg-tint text-blue flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-base font-bold">
                {[user.name?.[0], user.surname?.[0]].filter(Boolean).join('').toUpperCase() || '?'}
              </span>
              <div>
                <div className="text-base font-bold text-ink">{fullName}</div>
                {user.numberProfil ? (
                  <div className="text-faint text-[13px]">
                    {t('user.dashboard.profileNumber', { number: user.numberProfil })}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="my-4 h-px bg-line" />
            <div className="text-muted text-[13px]">{user.email}</div>
            {user.phone ? <div className="text-muted mt-1 text-[13px]">{user.phone}</div> : null}
          </div>

          <div className="rounded-card bg-ink p-6 text-white">
            <div className="text-[15px] font-bold">{t('user.dashboard.helpTitle')}</div>
            <p className="mt-2 mb-4 text-[13px] text-white/72">{t('user.dashboard.helpText')}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`mailto:${supportEmail}`}
                className="hover:bg-tint rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-ink"
              >
                {t('user.dashboard.helpWrite')}
              </a>
              {supportPhone ? (
                <a
                  href={`tel:${supportPhone.replace(/[^+\d]/g, '')}`}
                  className="rounded-full border border-white/30 px-4 py-2.5 text-[13px] font-bold text-white hover:border-white"
                >
                  {t('user.dashboard.helpCall')}
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <SelectProgramModal
        programs={programs}
        selected={user.programmSelected ? user.programm : null}
        open={programOpen}
        onClose={() => setProgramOpen(false)}
      />
    </>
  );
}
