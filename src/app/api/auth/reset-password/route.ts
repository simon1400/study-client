import { NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions } from '@/lib/auth-cookie';
import { strapiAuthFetch } from '@/lib/account';

/**
 * Установка нового пароля по одноразовому коду из письма.
 * Strapi в ответ выдаёт свежий JWT — сразу кладём его в куку,
 * чтобы человек попал в кабинет без отдельного входа.
 */
export async function POST(request: Request) {
  let body: { code?: string; password?: string; passwordConfirmation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { code, password, passwordConfirmation } = body;
  if (!code) {
    return NextResponse.json({ error: 'code' }, { status: 400 });
  }
  if (!password || password !== passwordConfirmation) {
    return NextResponse.json({ error: 'notControl' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'short' }, { status: 400 });
  }

  const { ok, data } = await strapiAuthFetch<{ jwt: string }>('/auth/reset-password', {
    token: null,
    method: 'POST',
    body: { code, password, passwordConfirmation },
  });

  if (!ok || !data?.jwt) {
    // единственный внятный вариант — ссылку уже использовали или она устарела
    return NextResponse.json({ error: 'code' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, data.jwt, authCookieOptions);
  return response;
}
