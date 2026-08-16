'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import type { BankDetails, ContractView } from '@/types/contract';
import type { AccountUser } from '@/types/account';

/**
 * Экран оплаты. Вкладки «Картой онлайн» из макета нет: платёжного шлюза у проекта
 * пока не подключено, а собирать номер карты у себя нельзя (PCI DSS). Остаётся
 * банковский перевод: реквизиты из CMS и кнопка «Я оплатил», после которой
 * менеджер сверяет поступление и переводит статус в «оплачено».
 */
export default function PaymentPanel({
  user,
  contract,
  bank,
  locale,
}: {
  user: AccountUser;
  contract: ContractView;
  bank: BankDetails | null;
  locale: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [plan, setPlan] = useState<'half' | 'full'>(user.paymentPlan === 'full' ? 'full' : 'half');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const paid = user.paymentStatus === 'paid';
  const pending = user.paymentStatus === 'pending';

  // суммы приходят посчитанными под сохранённый вариант; при переключении
  // на «всю сумму» показываем цену целиком, иначе — предоплату
  const dueLabel = plan === 'full' ? contract.priceLabel : contract.prepayLabel;
  const remainderLabel = plan === 'full' ? null : contract.remainderLabel;

  async function changePlan(next: 'half' | 'full') {
    setPlan(next);
    setError(false);
    try {
      await fetch('/api/account/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: next, locale }),
      });
    } catch {
      // выбор варианта — не критичная операция: при неудаче он останется локальным
    }
  }

  async function mark() {
    setSaving(true);
    setError(false);
    try {
      const res = await fetch('/api/account/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, locale }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
      <section className="rounded-panel border border-line bg-white p-6 md:px-8 md:py-[30px]">
        {paid ? (
          <Done
            title={t('user.payment.paidTitle')}
            text={t('user.payment.paidText')}
            action={
              <Link href="/user" className="btn btn-secondary !text-[15px]">
                {t('user.payment.toDashboard')}
              </Link>
            }
          />
        ) : pending ? (
          <Done
            title={t('user.payment.pendingTitle')}
            text={t('user.payment.pendingText')}
            action={
              <Link href="/user" className="btn btn-ghost !border !py-3 !text-[15px]">
                {t('user.payment.toDashboard')}
              </Link>
            }
          />
        ) : (
          <>
            <h1 className="font-display m-0 mb-5 text-[19px] font-semibold text-ink">
              {t('user.payment.title')}
            </h1>

            <label className="field-label !text-muted mb-1.5 !text-[13px]">
              {t('user.payment.planLabel')}
            </label>
            <div className="flex h-12 max-w-[420px] overflow-hidden rounded-xl border border-border">
              <Segment active={plan === 'half'} onClick={() => changePlan('half')}>
                {t('user.payment.half', { percent: contract.prepayPercent })}
              </Segment>
              <Segment active={plan === 'full'} onClick={() => changePlan('full')}>
                {t('user.payment.full')}
              </Segment>
            </div>

            <div className="mt-6 mb-1.5 text-[13px] font-semibold text-muted">{t('user.payment.method')}</div>

            {bank?.iban ? (
              <div className="bg-mist grid max-w-[520px] gap-2.5 rounded-2xl px-5 py-5 text-sm">
                <BankRow label={t('user.payment.beneficiary')} value={bank.beneficiary} />
                <BankRow label={t('user.payment.iban')} value={bank.iban} mono />
                <BankRow label={t('user.payment.swift')} value={bank.swift} mono />
                <BankRow label={t('user.payment.vs')} value={contract.customer.number} mono />
                <BankRow label={t('user.payment.amount')} value={dueLabel} bold />
              </div>
            ) : (
              <p className="bg-mist text-muted m-0 max-w-[520px] rounded-2xl px-5 py-4 text-sm">
                {t('user.payment.noBank')}
              </p>
            )}

            {bank?.note ? <p className="text-faint mt-3 max-w-[520px] text-xs">{bank.note}</p> : null}

            <button
              type="button"
              onClick={mark}
              disabled={saving || !bank?.iban}
              className="btn btn-secondary mt-6 !text-[15px]"
            >
              {t('user.payment.mark')}
            </button>
            {error ? <p className="field-message mt-2">{t('user.payment.error')}</p> : null}
            <p className="text-faint mt-3 text-xs">{t('user.payment.markNote')}</p>
          </>
        )}
      </section>

      <aside className="rounded-panel border border-line bg-white p-6 md:px-7 md:py-[26px] lg:sticky lg:top-24">
        <div className="font-display text-base font-semibold text-ink">{t('user.payment.order')}</div>
        <div className="mt-[18px] grid gap-2 text-sm">
          <Row label={t('user.contract.program')} value={contract.program} />
          <Row label={t('user.contract.price')} value={contract.priceLabel} />
        </div>
        <div className="my-4 h-px bg-line" />
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted text-sm">{t('user.payment.dueNow')}</span>
          <span className="text-xl font-bold text-ink">{dueLabel ?? '—'}</span>
        </div>
        {remainderLabel ? (
          <div className="text-faint mt-1.5 flex justify-between gap-3 text-[13px]">
            <span>{t('user.payment.remainder')}</span>
            <span>{remainderLabel}</span>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 cursor-pointer border-0 text-sm font-semibold transition-colors ${
        active ? 'bg-blue text-white' : 'text-muted bg-white hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function BankRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  bold?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className={`text-right text-ink ${bold ? 'font-bold' : 'font-semibold'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

function Done({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="px-4 py-6 text-center">
      <span className="bg-tint mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full">
        <span className="bg-blue flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white">
          ✓
        </span>
      </span>
      <h1 className="font-display mt-5 mb-2 text-xl font-semibold text-ink">{title}</h1>
      <p className="text-muted mx-auto max-w-[420px] text-sm">{text}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
