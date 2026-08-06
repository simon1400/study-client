'use client';

import { useState } from 'react';
import { pushEvent } from '@/lib/analytics';
import '@/styles/legacy/modal-done.scss';

type Errors = { name?: boolean; phone?: boolean; send?: boolean };

/** Дата в том же формате, что слала старая лямбда callCreate: 05.08.2026 18:40 */
function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CallForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErrors({ name: true });
    if (!phone.trim()) return setErrors({ phone: true });

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/call-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, time: formatNow() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      pushEvent('call_request');
      setName('');
      setPhone('');
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch {
      setErrors({ send: true });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="modal-done-wrap modal-call-done">
        <div className="big-circle-done" />
        <p>Спасибо! Мы свяжемся с вами в ближайшее время</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="call_input_name">Ваше имя</label>
      <input
        id="call_input_name"
        className={errors.name ? 'uk-form-danger' : ''}
        type="text"
        name="name"
        value={name}
        placeholder="Дмитрий"
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="call_input_phone">Телефон</label>
      <input
        id="call_input_phone"
        className={errors.phone ? 'uk-form-danger' : ''}
        type="text"
        name="phone"
        value={phone}
        placeholder="+7 (965) 77-253-77"
        onChange={(e) => setPhone(e.target.value)}
      />
      <button className="button button-accent" disabled={loading}>
        {loading ? <div uk-spinner="ratio: 0.5" style={{ marginLeft: '-20px', marginRight: '20px' }} /> : null}
        Заказать звонок
      </button>
      {errors.send ? (
        <div className="tm-call-danger">
          <span className="uk-text-danger">Произошла ошибка, обновите страницу и попробуйте снова</span>
        </div>
      ) : null}
    </form>
  );
}
