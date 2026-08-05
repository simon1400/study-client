'use client';

import { useState } from 'react';
import DoneModal from './DoneModal';
import { hideModal, showModal } from '@/lib/uikit';
import ModalPortal from './ModalPortal';

/**
 * Смена пароля из ЛК (старая `components/modals/password`).
 * Текущий пароль сверяет Strapi; поля сделаны password-инпутами — в старой
 * вёрстке они были обычным текстом и пароль читался с экрана.
 */

type PasswordError = 'notExist' | 'notControl' | 'short' | null;

export default function PasswordModal() {
  const [form, setForm] = useState({ currentPassword: '', password: '', passwordConfirmation: '' });
  const [error, setError] = useState<PasswordError>(null);
  const [loading, setLoading] = useState(false);

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.password !== form.passwordConfirmation) {
      setError('notControl');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: PasswordError };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'notExist');
        return;
      }

      setForm({ currentPassword: '', password: '', passwordConfirmation: '' });
      hideModal('#modal-password');
      showModal('#modal-password-done');
      setTimeout(() => hideModal('#modal-password-done'), 2000);
    } catch {
      setError('notExist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalPortal>
      <>
        <div id="modal-password" className="modal uk-modal-full" uk-modal="">
          <div className="uk-modal-dialog uk-height-1-1 uk-flex uk-flex-middle">
            <button className="uk-modal-close-full uk-close-large" type="button" uk-close="" />
            <div className="uk-width-1-1">
              <div className="uk-flex uk-flex-center uk-flex-middle">
                <div className="reg_wrap uk-width-1-1 uk-flex uk-flex-center uk-flex-wrap uk-margin-large-top">
                  {error === 'notExist' ? (
                    <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
                      <a className="uk-alert-close" uk-close="">
                        {null}
                      </a>
                      <p>Введен неправильный пароль</p>
                    </div>
                  ) : null}

                  {error === 'notControl' ? (
                    <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
                      <a className="uk-alert-close" uk-close="">
                        {null}
                      </a>
                      <p>Новый пароль не совпадает!</p>
                    </div>
                  ) : null}

                  {error === 'short' ? (
                    <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
                      <a className="uk-alert-close" uk-close="">
                        {null}
                      </a>
                      <p>Пароль должен быть не короче 6 символов</p>
                    </div>
                  ) : null}

                  <form className="input_wrap" onSubmit={submit}>
                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="password_current">
                        Старый пароль*
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="password_current"
                          className={error === 'notExist' ? 'uk-form-danger uk-input' : 'uk-input'}
                          name="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          onChange={handleInput}
                          tabIndex={1}
                          value={form.currentPassword}
                        />
                      </div>
                    </div>

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="password_new">
                        Новый пароль*
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="password_new"
                          className={error === 'notControl' || error === 'short' ? 'uk-form-danger uk-input' : 'uk-input'}
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          tabIndex={2}
                          onChange={handleInput}
                          value={form.password}
                        />
                      </div>
                    </div>

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="password_repeat">
                        Повторите пароль*
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="password_repeat"
                          className={error === 'notControl' ? 'uk-form-danger uk-input' : 'uk-input'}
                          name="passwordConfirmation"
                          type="password"
                          autoComplete="new-password"
                          tabIndex={3}
                          onChange={handleInput}
                          value={form.passwordConfirmation}
                        />
                      </div>
                    </div>

                    <button className="uk-button uk-width-1-1 uk-button-default" tabIndex={13} disabled={loading}>
                      Отправить
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DoneModal id="modal-password-done" label="Ваш пароль успешно изменен!" />
      </>
    </ModalPortal>
  );
}
