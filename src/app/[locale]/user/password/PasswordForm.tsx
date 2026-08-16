'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/** Смена пароля — в редизайне это раздел кабинета, а не модалка (макет «Смена пароля»). */
export default function PasswordForm() {
  const t = useTranslations('user.password');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);

    if (next.length < 8) return setError(t('tooShort'));
    if (next !== repeat) return setError(t('mismatch'));

    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: current,
          password: next,
          passwordConfirmation: repeat,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaved(true);
      setCurrent('');
      setNext('');
      setRepeat('');
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-panel max-w-[480px] border border-line bg-white p-6 md:px-8 md:py-[30px]">
      <h1 className="font-display m-0 mb-1.5 text-[19px] font-semibold text-ink">{t('title')}</h1>
      <p className="text-muted mb-6 text-sm">{t('hint')}</p>

      <form onSubmit={submit} className="grid gap-3.5" noValidate>
        <Field id="pw_current" label={t('current')} value={current} onChange={setCurrent} />
        <Field id="pw_new" label={t('new')} value={next} onChange={setNext} hint={t('rule')} />
        <Field id="pw_repeat" label={t('repeat')} value={repeat} onChange={setRepeat} />

        {error ? <span className="field-message">{error}</span> : null}

        <button type="submit" className="btn btn-secondary mt-2 justify-self-start !text-[15px]" disabled={saving}>
          {t('save')}
        </button>
      </form>

      {saved ? (
        <div className="bg-tint mt-4 rounded-xl px-4 py-3 text-[13px] text-ink">
          <b>✓</b> {t('saved')}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="field-label !text-muted !text-[13px]" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="password"
        autoComplete="new-password"
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="text-faint text-xs">{hint}</span> : null}
    </div>
  );
}
