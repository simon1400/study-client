import { NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions } from '@/lib/auth-cookie';
import { strapiAuthFetch } from '@/lib/account';

/**
 * Вход в личный кабинет. Раньше это была лямбда `login.js`, которая сверяла
 * пароль открытым текстом и складывала пользователя в localStorage.
 * Теперь пароль проверяет Strapi, а JWT уезжает в httpOnly-куку — в JS его нет.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const identifier = body.email?.trim();
  const password = body.password;
  if (!identifier || !password) {
    return NextResponse.json({ error: 'credentials' }, { status: 400 });
  }

  const { ok, data } = await strapiAuthFetch<{ jwt: string }>('/auth/local', {
    token: null,
    method: 'POST',
    body: { identifier, password },
  });

  if (!ok || !data?.jwt) {
    // Strapi не различает «нет такого пользователя» и «неверный пароль» — и правильно делает
    return NextResponse.json({ error: 'credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, data.jwt, authCookieOptions);
  return response;
}
