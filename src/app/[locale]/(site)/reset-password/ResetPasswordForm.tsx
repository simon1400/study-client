'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/**
 * Форма нового пароля. Одноразовый код приходит в `?code=…` из письма Strapi;
 * после успеха кука с JWT уже стоит, поэтому уходим в кабинет полной
 * перезагрузкой — чтобы шапка перечитала сессию.
 */

type ResetError = 'code' | 'notControl' | 'short' | 'server' | null;

export default function ResetPasswordForm() {
  const t = useTranslations('reset');
  const code = useSearchParams().get('code') ?? '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<ResetError>(code ? null : 'code');
  const [loading, setLoading] = useState(false);

  const messages: Record<Exclude<ResetError, null>, string> = {
    code: t('errorCode'),
    notControl: t('errorMismatch'),
    short: t('errorShort'),
    server: t('errorServer'),
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== passwordConfirmation) {
      setError('notControl');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password, passwordConfirmation }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: ResetError };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'server');
        return;
      }

      window.location.href = '/user';
    } catch {
      setError('server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-panel mx-auto max-w-[440px] border border-line bg-white p-8 md:px-10 md:py-9">
      <h1 className="h2-sub mb-1.5">{t('title')}</h1>
      <p className="text-muted mb-6 text-sm">{t('hint')}</p>

      <form onSubmit={submit} className="grid gap-3.5" noValidate>
        <div className="grid gap-1.5">
          <label className="field-label !text-muted !text-[13px]" htmlFor="reset_password">
            {t('password')}
          </label>
          <input
            id="reset_password"
            type="password"
            autoComplete="new-password"
            className={`field ${error === 'notControl' || error === 'short' ? 'field-error' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
        </div>

        <div className="grid gap-1.5">
          <label className="field-label !text-muted !text-[13px]" htmlFor="reset_password_repeat">
            {t('repeat')}
          </label>
          <input
            id="reset_password_repeat"
            type="password"
            autoComplete="new-password"
            className={`field ${error === 'notControl' ? 'field-error' : ''}`}
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              setError(null);
            }}
          />
        </div>

        {error ? <p className="field-message">{messages[error]}</p> : null}

        <button type="submit" className="btn btn-secondary btn-block mt-2" disabled={loading || !code}>
          {t('submit')}
        </button>
      </form>

      {error === 'code' ? (
        <p className="text-faint mt-4 text-center text-[13px]">
          <Link href="/login" className="text-blue hover:text-blue-dark underline underline-offset-2">
            {t('toLogin')}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
