'use client';

import { useLogin } from '@/components/auth/useLogin';
import ModalPortal from './ModalPortal';

/**
 * Полноэкранная модалка входа `#modal-login` — её открывает иконка пользователя
 * в шапке на мобильных (на десктопе форма живёт прямо в шапке).
 */
export default function LoginModal() {
  const login = useLogin();

  return (
    <ModalPortal>
      <div id="modal-login" className="modal uk-modal-full" uk-modal="">
        <div className="uk-modal-dialog uk-height-1-1 uk-flex uk-flex0-middle">
          <button className="uk-modal-close-full uk-close-large" type="button" uk-close="" />
          <div className="uk-width-1-1">
            <div className="uk-flex uk-flex-center uk-flex-middle uk-height-1-1">
              <div className="reg_wrap uk-width-1-1 uk-flex uk-flex-center uk-flex-wrap uk-margin-large-top">
                {login.error ? (
                  <div className="uk-alert-danger uk-text-center uk-position-relative" style={{ top: 0 }} uk-alert="">
                    <p>Неверный логин или пароль</p>
                  </div>
                ) : null}

                <form className="input_wrap" onSubmit={login.submit}>
                  <div className="uk-margin">
                    <label className="uk-form-label" htmlFor="modal_login_email">
                      Ваш email*
                    </label>
                    <div className="uk-form-controls">
                      <input
                        id="modal_login_email"
                        className={login.error ? 'uk-form-danger uk-input' : 'uk-input'}
                        name="email"
                        type="text"
                        placeholder="Email"
                        autoComplete="email"
                        tabIndex={1}
                        value={login.email}
                        onChange={(e) => login.handleEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="uk-margin">
                    <label className="uk-form-label" htmlFor="modal_login_password">
                      Ваш пароль*
                    </label>
                    <div className="uk-form-controls">
                      <input
                        id="modal_login_password"
                        className={login.error ? 'uk-form-danger uk-input' : 'uk-input'}
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        tabIndex={2}
                        value={login.password}
                        onChange={(e) => login.handlePassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button className="uk-button uk-width-1-1 uk-button-default" tabIndex={13} disabled={login.loading}>
                    Отправить
                  </button>
                  <p className="uk-text-center">
                    * для получения доступа нужно{' '}
                    <a href="#modal-registration" uk-toggle="">
                      заполнить анкету
                    </a>
                    <br />
                    <a href="#modal-forgot" uk-toggle="">
                      Забыли пароль?
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
