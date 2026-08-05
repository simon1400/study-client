'use client';

import { useState } from 'react';
import { useSession } from './SessionProvider';
import LoginModal from '@/components/modals/LoginModal';
import RegistrationModal from '@/components/modals/RegistrationModal';
import RegDoneModal from '@/components/modals/RegDoneModal';
import PasswordModal from '@/components/modals/PasswordModal';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';

/**
 * Модалки авторизации, общие для всего сайта: гостю — вход и регистрация,
 * вошедшему — смена пароля. В старом коде они висели в шапке (`header.js`).
 */
export default function AuthModals() {
  const { user, loading } = useSession();
  // пароль, который сервер сгенерировал при регистрации — показываем в «заявка принята»
  const [password, setPassword] = useState('');

  if (loading) return null;

  if (user) return <PasswordModal />;

  return (
    <>
      <LoginModal />
      <ForgotPasswordModal />
      <RegistrationModal onDone={setPassword} />
      <RegDoneModal password={password} />
    </>
  );
}
