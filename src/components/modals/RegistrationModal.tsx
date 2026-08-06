'use client';

import { useState } from 'react';
import country from '@/data/country.json';
import month from '@/data/month.json';
import { pushEvent } from '@/lib/analytics';
import { hideModal, showModal } from '@/lib/uikit';
import Preloader from '@/components/Preloader';
import ModalPortal from './ModalPortal';

/**
 * «Заполнить анкету» — регистрация (старая `components/modals/registration`).
 * Пароль по-прежнему придумывает сервер; после успеха человек уже залогинен
 * (кука приходит в ответе) и модалка сменяется на `#modal-done`.
 */

type RegError = 'email' | 'empty' | 'server' | null;

const MONTHS = month as Record<string, string>;
const COUNTRIES = country as Record<string, string>;

export default function RegistrationModal({ onDone }: { onDone: (password: string) => void }) {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    birthday: '',
    birthmonth: '',
    birthyear: '',
    sex: '',
    country: '',
    city: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState<RegError>(null);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function handleInput(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError(null);
    setEmptyFields([]);
  }

  const isEmpty = (field: string) => emptyFields.includes(field);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          // в Strapi дата рождения — строка «дд.мм.гггг», как и в старой Mongo
          birthday: `${form.birthday}.${form.birthmonth}.${form.birthyear}`,
          sex: form.sex,
          country: form.country,
          city: form.city,
          email: form.email,
          phone: form.phone,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; password?: string; error?: RegError; fields?: string[] };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'server');
        setEmptyFields(data.fields ?? []);
        return;
      }

      pushEvent('registration');
      onDone(data.password ?? '');
      hideModal('#modal-registration');
      showModal('#modal-done');
    } catch {
      setError('server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalPortal>
      <div id="modal-registration" className="modal uk-modal-full" uk-modal="">
        <div className="uk-modal-dialog uk-height-1-1 uk-flex uk-flex-middle">
          <button className="uk-modal-close-full uk-close-large" type="button" uk-close="" />
          <div className="uk-width-1-1">
            <div className="uk-container">
              <div className="uk-flex uk-flex-center uk-flex-middle">
                <div className="reg_wrap uk-width-1-1 uk-flex uk-flex-center uk-flex-wrap uk-margin-large-top">
                  {error === 'email' ? (
                    <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
                      <a className="uk-alert-close" uk-close="">
                        {null}
                      </a>
                      <p>Пользователь с таким емайлом уже существует. Ипользуйте другой или войдите. </p>
                    </div>
                  ) : null}
                  {error === 'empty' ? (
                    <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
                      <a className="uk-alert-close" uk-close="">
                        {null}
                      </a>
                      <p>Пожалуйста, заполните все поля. </p>
                    </div>
                  ) : null}
                  {error === 'server' ? (
                    <div className="uk-alert-danger" uk-alert="animation: true; duration: 200;">
                      <a className="uk-alert-close" uk-close="">
                        {null}
                      </a>
                      <p>Произошла ошибка, обновите страницу и попробуйте снова. </p>
                    </div>
                  ) : null}

                  <h2 className="modal-head">Персональная информация</h2>

                  <div className="input_wrap">
                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="reg_name">
                        Имя:
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="reg_name"
                          className={isEmpty('name') ? 'uk-form-danger uk-input' : 'uk-input'}
                          name="name"
                          type="text"
                          placeholder="Иван"
                          onChange={handleInput}
                          tabIndex={1}
                          value={form.name}
                        />
                      </div>
                    </div>

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="reg_birthday">
                        Дата рождения
                      </label>
                      <div className="tm-date-input uk-form-controls uk-grid uk-grid-collapse" uk-grid="">
                        <div className="uk-width-1-4">
                          <input
                            id="reg_birthday"
                            className="uk-input"
                            type="text"
                            placeholder="04"
                            name="birthday"
                            onChange={handleInput}
                            tabIndex={3}
                            value={form.birthday}
                          />
                        </div>
                        <div className="uk-width-1-2" uk-form-custom="target: > * > span:first-child">
                          <select name="birthmonth" onChange={handleInput} value={form.birthmonth} tabIndex={4}>
                            <option value="">Выберите...</option>
                            {Object.keys(MONTHS).map((key) => (
                              <option key={key} value={Number(key) < 10 ? `0${key}` : key}>
                                {MONTHS[key]}
                              </option>
                            ))}
                          </select>
                          <button className="tm-select" type="button" tabIndex={-1}>
                            <span />
                            <span uk-icon="icon: chevron-down" />
                          </button>
                        </div>
                        <div className="uk-width-1-4">
                          <input
                            className="uk-input"
                            type="text"
                            name="birthyear"
                            onChange={handleInput}
                            placeholder="1996"
                            tabIndex={5}
                            value={form.birthyear}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="reg_country">
                        Страна
                      </label>
                      <div className="uk-form-controls">
                        <div uk-form-custom="target: > * > span:first-child">
                          <select id="reg_country" name="country" onChange={handleInput} value={form.country} tabIndex={8}>
                            <option value="">Выберите...</option>
                            {Object.values(COUNTRIES).map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                          <button className="tm-select" type="button" tabIndex={-1}>
                            <span />
                            <span uk-icon="icon: chevron-down" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="uk-margin-large-bottom">
                      <label className="uk-form-label" htmlFor="reg_email">
                        E-mail
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="reg_email"
                          className={error === 'email' || isEmpty('email') ? 'uk-form-danger uk-input' : 'uk-input'}
                          type="email"
                          name="email"
                          onChange={handleInput}
                          placeholder="example@email.com"
                          tabIndex={10}
                          value={form.email}
                        />
                      </div>
                    </div>

                    <button
                      className="uk-button uk-button-text uk-visible@s"
                      type="button"
                      tabIndex={12}
                      onClick={() => hideModal('#modal-registration')}
                    >
                      Отмена
                    </button>
                  </div>

                  <div className="input_wrap">
                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="reg_surname">
                        Фамилия:
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="reg_surname"
                          className={isEmpty('surname') ? 'uk-form-danger uk-input' : 'uk-input'}
                          type="text"
                          name="surname"
                          onChange={handleInput}
                          placeholder="Иванов"
                          tabIndex={2}
                          value={form.surname}
                        />
                      </div>
                    </div>

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="radio_1">
                        Пол
                      </label>
                      <div className="tm-radio uk-form-controls uk-grid uk-grid-collapse uk-child-width-1-2" uk-grid="">
                        <div>
                          <input
                            className="uk-radio"
                            type="radio"
                            id="radio_1"
                            value="Мужской"
                            checked={form.sex === 'Мужской'}
                            tabIndex={6}
                            onChange={handleInput}
                            name="sex"
                          />
                          <label htmlFor="radio_1">Мужской</label>
                        </div>
                        <div>
                          <input
                            className="uk-radio"
                            type="radio"
                            id="radio_2"
                            value="Женский"
                            checked={form.sex === 'Женский'}
                            tabIndex={7}
                            onChange={handleInput}
                            name="sex"
                          />
                          <label htmlFor="radio_2">Женский</label>
                        </div>
                      </div>
                    </div>

                    <div className="uk-margin">
                      <label className="uk-form-label" htmlFor="reg_city">
                        Город
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="reg_city"
                          className={isEmpty('city') ? 'uk-form-danger uk-input' : 'uk-input'}
                          type="text"
                          name="city"
                          onChange={handleInput}
                          placeholder="Киев"
                          tabIndex={9}
                          value={form.city}
                        />
                      </div>
                    </div>

                    <div className="uk-margin-large-bottom">
                      <label className="uk-form-label" htmlFor="reg_phone">
                        Телефон
                      </label>
                      <div className="uk-form-controls">
                        <input
                          id="reg_phone"
                          className={isEmpty('phone') ? 'uk-form-danger uk-input' : 'uk-input'}
                          type="text"
                          name="phone"
                          onChange={handleInput}
                          placeholder="+7 777 777 777"
                          tabIndex={11}
                          value={form.phone}
                        />
                      </div>
                    </div>

                    <button
                      className="uk-button uk-button-text uk-hidden@s"
                      type="button"
                      tabIndex={12}
                      onClick={() => hideModal('#modal-registration')}
                    >
                      Отмена
                    </button>
                    <button
                      className="uk-button uk-button-default uk-align-right"
                      type="button"
                      onClick={submit}
                      tabIndex={13}
                      disabled={loading}
                    >
                      Отправить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {loading ? <Preloader /> : null}
      </div>
    </ModalPortal>
  );
}
