'use client';

import { useState } from 'react';
import DoneModal from './DoneModal';
import { pushEvent } from '@/lib/analytics';
import { hideModal, showModal } from '@/lib/uikit';
import ModalPortal from './ModalPortal';

/**
 * «Закажите звонок» — модалка `#modal-call` (старая `components/modals/call`).
 * Пишет ту же заявку, что форма на главной: `POST /api/call-request` → Strapi.
 * На публичных страницах нового сайта на неё пока никто не ссылается, зато
 * ссылаются оба сайдбара личного кабинета.
 */

/** Дата в том же формате, что слала старая лямбда callCreate: 05.08.2026 18:40 */
function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CallModal() {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/call-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, time: formatNow() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      pushEvent('call_request');
      setForm({ name: '', phone: '' });
      hideModal('#modal-call');
      showModal('#modal-call-done');
      setTimeout(() => hideModal('#modal-call-done'), 4000);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalPortal>
      <>
        <div id="modal-call" className="modal uk-modal-full" uk-modal="">
          <div className="uk-modal-dialog uk-height-1-1 uk-flex uk-flex0-middle">
            <button className="uk-modal-close-full uk-close-large" type="button" uk-close="" />
            <div className="uk-width-1-1">
              <div className="uk-flex uk-flex-center uk-flex-middle uk-height-1-1">
                <div className="reg_wrap uk-width-1-1 uk-flex uk-flex-center uk-flex-wrap uk-margin-large-top">
                  <form className="input_wrap" onSubmit={submit}>
                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="modal_call_name">
                        Ваше имя*
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="modal_call_name"
                          className={error ? 'uk-form-danger uk-input' : 'uk-input'}
                          name="name"
                          type="text"
                          placeholder="Иван Иванов"
                          onChange={handleInput}
                          tabIndex={1}
                          value={form.name}
                        />
                      </div>
                    </div>

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="modal_call_phone">
                        Ваш телефон*
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="modal_call_phone"
                          className={error ? 'uk-form-danger uk-input' : 'uk-input'}
                          name="phone"
                          type="text"
                          tabIndex={2}
                          onChange={handleInput}
                          value={form.phone}
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
        <DoneModal id="modal-call-done" label="Ваша заявка принята. Ожидайте звонка в ближайшее время!" />
      </>
    </ModalPortal>
  );
}
