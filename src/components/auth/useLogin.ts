'use client';

import { useState } from 'react';

/**
 * Общая логика входа для двух форм: выпадашки в шапке и полноэкранной
 * модалки `#modal-login` (её открывает иконка пользователя на мобильных).
 *
 * После успеха уходим в ЛК жёстким переходом, как на старом сайте: кука с JWT
 * ставится ответом роут-хендлера, и полная перезагрузка гарантирует, что её
 * увидят и серверные страницы, и шапка.
 */
export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      setError(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('login failed');
      window.location.href = '/user/personal-area';
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  function handleEmail(value: string) {
    setEmail(value);
    setError(false);
  }

  function handlePassword(value: string) {
    setPassword(value);
    setError(false);
  }

  return { email, password, error, loading, submit, handleEmail, handlePassword };
}
