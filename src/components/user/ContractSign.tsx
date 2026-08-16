'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import type { ContractView } from '@/types/contract';

/**
 * Правая колонка страницы договора: сводка, подпись и кнопки после подписания
 * (макет «Договор»). Подписью считается ФИО — так же, как в макете.
 */
export default function ContractSign({
  contract,
  locale,
  signed,
}: {
  contract: ContractView;
  locale: string;
  signed: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [signature, setSignature] = useState(contract.signature ?? '');
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const canSign = agree && signature.trim().length > 3 && !saving;

  async function sign() {
    if (!canSign) return;
    setSaving(true);
    setError(false);
    try {
      const res = await fetch('/api/account/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signature.trim(), agree: true, locale }),
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
    <aside className="rounded-panel border border-line bg-white p-6 md:px-7 md:py-[26px] lg:sticky lg:top-24">
      <div className="font-display text-base font-semibold text-ink">{t('user.contract.signTitle')}</div>

      <div className="my-[18px] grid gap-2 text-sm">
        <Row label={t('user.contract.program')} value={contract.program} />
        <Row label={t('user.contract.price')} value={contract.priceLabel} />
        <Row
          label={t('user.contract.prepay', { percent: contract.prepayPercent })}
          value={contract.prepayLabel}
        />
      </div>

      <div className="mb-[18px] h-px bg-line" />

      {signed ? (
        <>
          <div className="bg-tint flex items-center gap-2.5 rounded-2xl px-4 py-3.5">
            <span className="bg-blue flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[13px] text-white">
              ✓
            </span>
            <div className="text-[13px]">
              <b className="text-ink">{t('user.contract.signedTitle')}</b>
              <br />
              <span className="text-muted">
                {[contract.signedAt, contract.signature].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>

          <Link href="/user/payment" className="btn btn-primary btn-block mt-4 !text-[15px]">
            {t('user.contract.toPayment')}
          </Link>
          <a
            href={`/api/account/contract/pdf?locale=${encodeURIComponent(locale)}`}
            className="btn btn-ghost btn-block mt-2.5 !border !py-3 !text-sm"
          >
            {t('user.contract.downloadPdf')}
          </a>
        </>
      ) : (
        <>
          <label className="field-label !text-muted mb-1.5 !text-[13px]" htmlFor="contract_signature">
            {t('user.contract.signatureLabel')}
          </label>
          <input
            id="contract_signature"
            className="field"
            value={signature}
            placeholder={t('user.contract.signaturePlaceholder')}
            onChange={(e) => setSignature(e.target.value)}
          />

          <label className="my-3.5 flex cursor-pointer items-start gap-2.5 text-[13px] text-body">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree((v) => !v)}
              className="accent-blue mt-0.5 h-[18px] w-[18px] shrink-0"
            />
            {t('user.contract.agree')}
          </label>

          <button
            type="button"
            onClick={sign}
            disabled={!canSign}
            className={`btn btn-block !text-[15px] ${canSign ? 'btn-secondary' : 'bg-mist !text-faint !cursor-not-allowed'}`}
          >
            {t('user.contract.sign')}
          </button>

          {error ? <p className="field-message mt-2">{t('user.contract.signError')}</p> : null}
          <p className="text-faint mt-3 text-xs">{t('user.contract.signNote')}</p>
        </>
      )}
    </aside>
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
