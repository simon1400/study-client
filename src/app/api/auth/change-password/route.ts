import { NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions } from '@/lib/auth-cookie';
import { getToken, strapiAuthFetch } from '@/lib/account';

/**
 * Смена пароля из ЛК (модалка `#modal-password`). Штатный эндпоинт Strapi
 * сам проверяет текущий пароль и выдаёт свежий JWT — старую куку заменяем.
 */
export async function POST(request: Request) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { currentPassword?: string; password?: string; passwordConfirmation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { currentPassword, password, passwordConfirmation } = body;
  if (!currentPassword || !password) {
    return NextResponse.json({ error: 'notExist' }, { status: 400 });
  }
  if (password !== passwordConfirmation) {
    return NextResponse.json({ error: 'notControl' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'short' }, { status: 400 });
  }

  const { ok, data } = await strapiAuthFetch<{ jwt: string }>('/auth/change-password', {
    token,
    method: 'POST',
    body: { currentPassword, password, passwordConfirmation },
  });

  if (!ok || !data?.jwt) {
    return NextResponse.json({ error: 'notExist' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, data.jwt, authCookieOptions);
  return response;
}
