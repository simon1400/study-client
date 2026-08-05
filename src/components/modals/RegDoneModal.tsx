'use client';

import '@/styles/legacy/modal-reg-done.scss';
import ModalPortal from './ModalPortal';

/**
 * «Ваша заявка принята» после регистрации (старая `components/modals/reg-done`).
 *
 * Обычно пароль уходит письмом, и текст здесь ровно такой же, как на старом сайте.
 * Показываем пароль на экране, только если письмо отправить не удалось (нет ключа
 * Resend, не верифицирован домен) — иначе войти второй раз было бы нечем.
 */
export default function RegDoneModal({ password }: { password: string }) {
  return (
    <ModalPortal>
      <div id="modal-done" className="modal uk-modal-full uk-modal" uk-modal="">
        <div className="uk-modal-dialog uk-height-1-1 uk-flex uk-flex-middle">
          <button className="uk-modal-close-full uk-close-large" type="button" uk-close="" />
          <div className="uk-flex uk-flex-center uk-flex-middle uk-width-1-1 uk-height-1-1">
            <div className="modal-done-wrap">
              <div className="big-circle-done" />
              <h2>Ваша заявка принята!</h2>
              {password ? (
                <>
                  <p>
                    Ваш пароль для входа: <b>{password}</b>
                  </p>
                  <p>Сохраните его — письмо с паролем отправить не удалось.</p>
                </>
              ) : (
                <p>Мы отправили Вам письмо с паролем на указанный почтовый ящик.</p>
              )}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- нужна полная перезагрузка:
                  кука с JWT только что поставлена ответом, и шапка должна перечитать сессию */}
              <a href="/user/personal-area" className="button button_blue">
                Продолжить
              </a>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
