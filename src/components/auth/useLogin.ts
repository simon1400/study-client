'use client';

import { useState } from 'react';

/**
 * Логика входа для страницы `/login` (в редизайне вход — отдельный экран,
 * а не модалка).
 *
 * После успеха уходим в ЛК жёстким переходом, как на старом сайте: кука с JWT
 * ставится ответом роут-хендлера, и полная перезагрузка гарантирует, что её
 * увидят и серверные страницы, и шапка.
 */
export function useLogin({ redirectTo = '/user' }: { redirectTo?: string } = {}) {
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
      window.location.href = redirectTo;
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
