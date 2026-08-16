'use client';

/* eslint-disable @next/next/no-img-element -- SVG-логотип из public/ */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useLogin } from '@/components/auth/useLogin';

/**
 * Экран входа по макету «Личный кабинет → Вход»: карточка 440px по центру,
 * без шапки и подвала сайта.
 *
 * Восстановление пароля здесь же, вторым состоянием формы, а не модалкой:
 * страница живёт вне группы `(site)`, где смонтированы модалки UIkit.
 */
export default function LoginForm({ supportEmail }: { supportEmail: string }) {
  const t = useTranslations();
  const login = useLogin();
  const [mode, setMode] = useState<'login' | 'forgot' | 'sent'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function submitForgot(event: React.FormEvent) {
    event.preventDefault();
    if (!forgotEmail.trim()) return setForgotError(true);

    setForgotLoading(true);
    setForgotError(false);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMode('sent');
    } catch {
      setForgotError(true);
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="bg-mist flex min-h-screen items-center justify-center px-5 py-10">
      <div className="rounded-panel w-full max-w-[440px] border border-line bg-white p-8 text-center md:px-10 md:pt-10 md:pb-9">
        <Link href="/" className="inline-flex" aria-label="Study in Czech">
          <img src="/logo_ru-blue.svg" alt="Study in Czech" className="h-11 w-auto" />
        </Link>

        {mode === 'login' ? (
          <>
            <h1 className="h2-sub mt-5 mb-1.5">{t('login.title')}</h1>
            <p className="text-muted mb-6 text-sm">{t('login.hint')}</p>

            <form onSubmit={login.submit} className="grid gap-3.5 text-left" noValidate>
              <Field
                id="login_email"
                label={t('login.email')}
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={login.email}
                invalid={login.error}
                onChange={login.handleEmail}
              />
              <Field
                id="login_password"
                label={t('login.password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={login.password}
                invalid={login.error}
                onChange={login.handlePassword}
              />

              {login.error ? <span className="field-message">{t('login.error')}</span> : null}

              <button type="submit" className="btn btn-secondary btn-block mt-2" disabled={login.loading}>
                {login.loading ? t('common.loading') : t('nav.login')}
              </button>
            </form>

            <p className="text-faint mt-4 text-[13px]">
              <LinkLike onClick={() => setMode('forgot')}>{t('login.forgot')}</LinkLike>
            </p>
            <p className="text-faint mt-2 text-[13px]">
              {t('login.noMail')} <a href={`mailto:${supportEmail}`}>{t('login.writeUs')}</a>
            </p>
          </>
        ) : null}

        {mode === 'forgot' ? (
          <>
            <h1 className="h2-sub mt-5 mb-1.5">{t('login.resetTitle')}</h1>
            <p className="text-muted mb-6 text-sm">{t('login.resetHint')}</p>

            <form onSubmit={submitForgot} className="grid gap-3.5 text-left" noValidate>
              <Field
                id="forgot_email"
                label={t('login.email')}
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={forgotEmail}
                invalid={forgotError}
                onChange={(v) => {
                  setForgotEmail(v);
                  setForgotError(false);
                }}
              />
              {forgotError ? <span className="field-message">{t('login.resetError')}</span> : null}
              <button type="submit" className="btn btn-secondary btn-block mt-2" disabled={forgotLoading}>
                {forgotLoading ? t('common.loading') : t('login.resetSubmit')}
              </button>
            </form>

            <p className="text-faint mt-4 text-[13px]">
              <LinkLike onClick={() => setMode('login')}>{t('common.back')}</LinkLike>
            </p>
          </>
        ) : null}

        {mode === 'sent' ? (
          <>
            <span className="bg-tint mx-auto mt-6 flex h-[88px] w-[88px] items-center justify-center rounded-full">
              <span className="bg-blue flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white">
                ✓
              </span>
            </span>
            <h1 className="h2-sub mt-5 mb-1.5">{t('login.sentTitle')}</h1>
            <p className="text-muted mb-6 text-sm">{t('login.sentText')}</p>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setMode('login')}>
              {t('common.back')}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  placeholder,
  autoComplete,
  invalid,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="field-label !text-muted !text-[13px]" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`field ${invalid ? 'field-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function LinkLike({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-blue hover:text-blue-dark cursor-pointer border-0 bg-transparent p-0 text-[13px] underline underline-offset-2"
    >
      {children}
    </button>
  );
}
