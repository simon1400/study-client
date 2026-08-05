'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Форма нового пароля. Одноразовый код приходит в `?code=…` из письма Strapi;
 * после успеха кука с JWT уже стоит, поэтому уходим в кабинет полной
 * перезагрузкой — чтобы шапка перечитала сессию.
 */

type ResetError = 'code' | 'notControl' | 'short' | 'server' | null;

const MESSAGES: Record<Exclude<ResetError, null>, string> = {
  code: 'Ссылка недействительна или уже использована. Запросите восстановление пароля ещё раз.',
  notControl: 'Пароли не совпадают',
  short: 'Пароль должен быть не короче 6 символов',
  server: 'Произошла ошибка, обновите страницу и попробуйте снова',
};

export default function ResetPasswordForm() {
  const code = useSearchParams().get('code') ?? '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<ResetError>(code ? null : 'code');
  const [loading, setLoading] = useState(false);

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

      window.location.href = '/user/personal-area';
    } catch {
      setError('server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="input_wrap" onSubmit={submit}>
      {error ? (
        <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
          <a className="uk-alert-close" uk-close="">
            {null}
          </a>
          <p>{MESSAGES[error]}</p>
        </div>
      ) : null}

      <div className="uk-margin">
        <label className="uk-form-label" htmlFor="reset_password">
          Новый пароль*
        </label>
        <div className="uk-form-controls">
          <input
            id="reset_password"
            className={error === 'notControl' || error === 'short' ? 'uk-form-danger uk-input' : 'uk-input'}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
        </div>
      </div>

      <div className="uk-margin">
        <label className="uk-form-label" htmlFor="reset_password_repeat">
          Повторите пароль*
        </label>
        <div className="uk-form-controls">
          <input
            id="reset_password_repeat"
            className={error === 'notControl' ? 'uk-form-danger uk-input' : 'uk-input'}
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              setError(null);
            }}
          />
        </div>
      </div>

      <button className="uk-button uk-width-1-1 uk-button-default" disabled={loading || !code}>
        Сохранить пароль
      </button>
    </form>
  );
}
