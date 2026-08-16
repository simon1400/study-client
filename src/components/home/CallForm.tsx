'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { pushEvent } from '@/lib/analytics';

type Errors = { name?: boolean; phone?: boolean; send?: boolean };

/** Дата в том же формате, что слала старая лямбда callCreate: 05.08.2026 18:40 */
function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Форма «Заказать звонок» — белая карточка внутри синего блока (макет главной). */
export default function CallForm() {
  const t = useTranslations('callForm');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErrors({ name: true });
    if (!phone.trim()) return setErrors({ phone: true });

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/call-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, time: formatNow() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      pushEvent('call_request');
      setName('');
      setPhone('');
      setDone(true);
    } catch {
      setErrors({ send: true });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card bg-white/10 p-10 text-center">
        <div className="font-display mb-2.5 text-[22px] text-white">{t('sentTitle')}</div>
        <p className="text-on-blue m-0">{t('sentText')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card flex flex-col gap-3.5 bg-white p-6 md:p-8" noValidate>
      <div className="flex flex-col gap-2">
        <label className="field-label" htmlFor="call_input_name">
          {t('name')}
        </label>
        <input
          id="call_input_name"
          className={`field ${errors.name ? 'field-error' : ''}`}
          type="text"
          name="name"
          value={name}
          placeholder={t('namePlaceholder')}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name ? <span className="field-message">{t('errorName')}</span> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="field-label" htmlFor="call_input_phone">
          {t('phone')}
        </label>
        <input
          id="call_input_phone"
          className={`field ${errors.phone ? 'field-error' : ''}`}
          type="tel"
          name="phone"
          value={phone}
          placeholder={t('phonePlaceholder')}
          onChange={(e) => setPhone(e.target.value)}
        />
        {errors.phone ? <span className="field-message">{t('errorPhone')}</span> : null}
      </div>

      <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading}>
        {t('submit')}
      </button>

      {errors.send ? <span className="field-message text-center">{t('errorSend')}</span> : null}
      <p className="caption m-0 text-center">{t('privacy')}</p>
    </form>
  );
}
