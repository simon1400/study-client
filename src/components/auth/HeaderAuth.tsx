'use client';

/* eslint-disable @next/next/no-img-element -- статика из public/, размеры задаёт SCSS */
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useSession } from './SessionProvider';
import { useLogin } from './useLogin';
import LinkButton from './LinkButton';
import { showModal } from '@/lib/uikit';

/**
 * Правый блок нижней части шапки: «Войти» с выпадающей формой у гостя,
 * имя с выпадашкой ЛК у залогиненного. Разметка 1:1 со старым `header.js`.
 */
export default function HeaderAuth() {
  const { user, loading, logout } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const login = useLogin();

  // пока сессия не приехала — место занято, но пусто: иначе у залогиненного
  // на долю секунды мигает «Войти»
  if (loading) return <div className="login-form" />;

  if (user) {
    return (
      <div className="login-form">
        <div className="uk-text-right loggin-user-button">
          <button className="button button-bare" type="button">
            {[user.name, user.surname].filter(Boolean).join(' ')}
          </button>
          <img src="/angle-down-light.svg" alt="Down" />
        </div>
        <div className="drop-user" uk-dropdown="mode: hover; pos: bottom-right; offset: 20; duration: 200">
          <ul>
            <li>
              <Link href="/user/personal-area">Личный кабинет</Link>
            </li>
            <li>
              <Link href={`/user/questionnaire/step-${user.stepQuestionare}`}>Моя анкета</Link>
            </li>
            <li>
              <LinkButton onClick={() => showModal('#modal-password')}>Изменить пароль</LinkButton>
            </li>
            <li>
              <LinkButton onClick={() => void logout()}>Выйти</LinkButton>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="login-form">
      <div className="uk-text-right">
        <span className="tm-icons tm-icon-exit" />
        <button className="button button-bare" type="button" onClick={() => setShowLogin(!showLogin)}>
          Войти
        </button>
      </div>

      <div className={`modal-login ${!showLogin ? 'uk-hidden' : ''}`}>
        <form id="login" onSubmit={login.submit}>
          {login.error ? (
            <div className="uk-alert-danger uk-text-center uk-position-relative" style={{ top: 0 }} uk-alert="">
              <p>Неверный логин или пароль</p>
            </div>
          ) : null}
          <input
            className={login.error ? 'uk-form-danger' : ''}
            type="text"
            placeholder="Email"
            name="email"
            autoComplete="email"
            value={login.email}
            onChange={(e) => login.handleEmail(e.target.value)}
          />
          <input
            className={login.error ? 'uk-form-danger' : ''}
            type="password"
            placeholder="Пароль"
            name="password"
            autoComplete="current-password"
            value={login.password}
            onChange={(e) => login.handlePassword(e.target.value)}
          />
          <p>
            * для получения доступа нужно{' '}
            <a href="#modal-registration" uk-toggle="">
              заполнить анкету
            </a>
          </p>
        </form>
        <button type="submit" form="login" className="button button-blue" disabled={login.loading}>
          Авторизоваться
        </button>
        {login.loading ? (
          <div className="loadding">
            <div uk-spinner="" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
