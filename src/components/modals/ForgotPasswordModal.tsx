'use client';

import { useState } from 'react';
import ModalPortal from './ModalPortal';

/**
 * «Забыли пароль» — модалка `#modal-forgot`, её открывает ссылка под формой входа.
 * На старом сайте восстановления не было вовсе: пароль знал только тот, кому
 * пришло письмо при регистрации.
 */
export default function ForgotPasswordModal() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalPortal>
      <div id="modal-forgot" className="modal uk-modal-full" uk-modal="">
        <div className="uk-modal-dialog uk-height-1-1 uk-flex uk-flex-middle">
          <button className="uk-modal-close-full uk-close-large" type="button" uk-close="" />
          <div className="uk-width-1-1">
            <div className="uk-flex uk-flex-center uk-flex-middle">
              <div className="reg_wrap uk-width-1-1 uk-flex uk-flex-center uk-flex-wrap uk-margin-large-top">
                {sent ? (
                  <div className="input_wrap uk-text-center">
                    <h2 className="modal-head">Письмо отправлено</h2>
                    <p>
                      Если такой адрес зарегистрирован, мы отправили на него ссылку для смены пароля.
                      Ссылка одноразовая.
                    </p>
                    <button className="uk-button uk-width-1-1 uk-button-default uk-modal-close" type="button">
                      Закрыть
                    </button>
                  </div>
                ) : (
                  <form className="input_wrap" onSubmit={submit}>
                    <h2 className="modal-head">Восстановление пароля</h2>
                    {error ? (
                      <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
                        <a className="uk-alert-close" uk-close="">
                          {null}
                        </a>
                        <p>Укажите email, на который зарегистрирован кабинет</p>
                      </div>
                    ) : null}

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="forgot_email">
                        Ваш email*
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="forgot_email"
                          className={error ? 'uk-form-danger uk-input' : 'uk-input'}
                          name="email"
                          type="email"
                          placeholder="example@email.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError(false);
                          }}
                        />
                      </div>
                    </div>

                    <button className="uk-button uk-width-1-1 uk-button-default" disabled={loading}>
                      Отправить
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
