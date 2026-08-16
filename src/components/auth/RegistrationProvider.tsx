'use client';

import { createContext, useContext, useState } from 'react';
import { useTranslations } from 'next-intl';
import country from '@/data/country.json';
import { pushEvent } from '@/lib/analytics';

/**
 * Заявка «Заполнить анкету» и экран «Заявка принята» (макет «Личный кабинет»).
 *
 * Своя модалка вместо UIkit: та переносила разметку в `<body>` и роняла React
 * при уходе со страницы, а в редизайне кабинет UIkit вообще не тянет.
 * Открывается из шапки и кнопок CTA через `useRegistration().open()`.
 */

type RegistrationValue = { open: () => void };

const RegistrationContext = createContext<RegistrationValue>({ open: () => {} });

export function useRegistration() {
  return useContext(RegistrationContext);
}

const COUNTRIES = country as Record<string, string>;

type Screen = 'form' | 'done';
type RegError = 'email' | 'empty' | 'server' | null;

const EMPTY = {
  name: '',
  surname: '',
  birthday: '',
  sex: '',
  country: '',
  city: '',
  email: '',
  phone: '',
};

export default function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations('registration');
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('form');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<RegError>(null);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  /** Пароль приходит с сервера, только если письмо с ним не ушло. */
  const [password, setPassword] = useState('');

  function show() {
    setForm(EMPTY);
    setError(null);
    setEmptyFields([]);
    setPassword('');
    setScreen('form');
    setOpen(true);
  }

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setEmptyFields([]);
  }

  const invalid = (field: string) => emptyFields.includes(field);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const missing = Object.entries(form)
      .filter(([, value]) => !value.trim())
      .map(([key]) => key);
    if (missing.length) {
      setError('empty');
      setEmptyFields(missing);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        password?: string;
        error?: RegError;
        fields?: string[];
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'server');
        setEmptyFields(data.fields ?? []);
        return;
      }

      pushEvent('registration');
      setPassword(data.password ?? '');
      setScreen('done');
    } catch {
      setError('server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RegistrationContext.Provider value={{ open: show }}>
      {children}

      {open ? (
        <div
          className="bg-ink/55 fixed inset-0 z-60 flex items-start justify-center overflow-auto p-5 md:py-12"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {screen === 'form' ? (
            <form
              onSubmit={submit}
              noValidate
              className="rounded-panel w-full max-w-[660px] bg-white p-6 shadow-[0_24px_64px_rgba(11,14,44,.25)] md:px-10 md:pt-9 md:pb-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-blue text-xs font-bold tracking-[0.08em] uppercase">
                    {t('eyebrow')}
                  </div>
                  <h2 className="font-display text-ink mt-2 mb-1 text-[22px] font-semibold">{t('title')}</h2>
                  <p className="text-muted m-0 text-sm">{t('subtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="✕"
                  className="text-muted hover:border-blue hover:text-blue flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-x-5">
                <Field label={t('name')} value={form.name} invalid={invalid('name')} placeholder="Дмитрий" onChange={(v) => set('name', v)} />
                <Field label={t('surname')} value={form.surname} invalid={invalid('surname')} placeholder="Печунка" onChange={(v) => set('surname', v)} />
                <Field
                  label={t('birthday')}
                  value={form.birthday}
                  invalid={invalid('birthday')}
                  placeholder={t('birthdayPlaceholder')}
                  onChange={(v) => set('birthday', v)}
                />

                <div className="grid content-start gap-1.5">
                  <span className="text-muted text-[13px] font-semibold">{t('sex')}</span>
                  <div className={`flex h-12 overflow-hidden rounded-xl border ${invalid('sex') ? 'border-danger' : 'border-border'}`}>
                    {[t('male'), t('female')].map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={form.sex === option}
                        onClick={() => set('sex', option)}
                        className={`flex-1 cursor-pointer border-0 text-sm font-semibold transition-colors ${
                          form.sex === option ? 'bg-blue text-white' : 'text-muted bg-white hover:text-ink'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid content-start gap-1.5">
                  <span className="text-muted text-[13px] font-semibold">{t('country')}</span>
                  <select
                    className={`field ${invalid('country') ? 'field-error' : ''}`}
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                  >
                    <option value="">—</option>
                    {Object.values(COUNTRIES).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <Field label={t('city')} value={form.city} invalid={invalid('city')} placeholder={t('cityPlaceholder')} onChange={(v) => set('city', v)} />
                <Field label={t('email')} type="email" value={form.email} invalid={invalid('email') || error === 'email'} placeholder="example@email.com" onChange={(v) => set('email', v)} />
                <Field label={t('phone')} type="tel" value={form.phone} invalid={invalid('phone')} placeholder={t('phonePlaceholder')} onChange={(v) => set('phone', v)} />
              </div>

              {error ? (
                <p className="field-message mt-4">
                  {error === 'email' ? t('errorEmail') : error === 'empty' ? t('errorEmpty') : t('errorServer')}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-line pt-5 md:flex-row md:items-center md:gap-5">
                <p className="text-faint m-0 max-w-[320px] text-[13px]">{t('note')}</p>
                <button type="submit" className="btn btn-primary btn-block !text-[15px] md:!inline-flex md:!w-auto" disabled={loading}>
                  {t('submit')}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-panel w-full max-w-[560px] bg-white p-8 text-center shadow-[0_24px_64px_rgba(11,14,44,.25)] md:px-12 md:pt-11 md:pb-10">
              <span className="bg-tint mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full">
                <span className="bg-blue flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white">
                  ✓
                </span>
              </span>
              <h2 className="font-display text-ink mt-5 mb-2 text-[22px] font-semibold">{t('doneTitle')}</h2>
              <p className="text-muted mb-6 text-[15px]">
                {password ? t('doneWithPassword') : t('doneMailed')}
              </p>

              <div className="bg-mist rounded-2xl border border-line px-5 py-4 text-left">
                <div className="text-faint text-xs">{t('mailFrom')}</div>
                <div className="text-ink mt-1.5 text-sm font-semibold">{t('mailLabel')}</div>
                <div
                  className={`mt-2 rounded-[10px] border border-dashed border-border bg-white px-3.5 py-2.5 text-[15px] ${
                    password ? 'text-blue font-mono tracking-[0.04em]' : 'text-muted'
                  }`}
                >
                  {password || t('mailHidden', { email: form.email })}
                </div>
                <div className="text-faint mt-2 text-xs">{t('mailHint')}</div>
              </div>

              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- намеренно полная
                  перезагрузка: кука с JWT уже стоит, но серверные страницы о ней ещё не знают */}
              <a href="/user" className="btn btn-secondary btn-block mt-6 !text-[15px]">
                {t('toCabinet')}
              </a>
            </div>
          )}
        </div>
      ) : null}
    </RegistrationContext.Provider>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <span className="text-muted text-[13px] font-semibold">{label}</span>
      <input
        type={type}
        className={`field ${invalid ? 'field-error' : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
