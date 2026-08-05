import { NextResponse } from 'next/server';
import { AUTH_COOKIE, authCookieOptions } from '@/lib/auth-cookie';
import { strapiAuthFetch } from '@/lib/account';

/**
 * Регистрация из модалки «Заполнить анкету» (старая лямбда `userCreate.js`).
 * Strapi заводит пользователя, пустую анкету и сразу отдаёт JWT — кладём его
 * в куку, чтобы человек попадал в ЛК без второго входа.
 *
 * Пароль генерирует сервер, как и раньше. Письмо с ним появится на этапе 6
 * (Resend), а до тех пор он возвращается сюда и показывается в модалке —
 * иначе зарегистрировавшийся не сможет войти повторно.
 */

const FIELDS = ['name', 'surname', 'birthday', 'sex', 'country', 'city', 'phone', 'email'] as const;

type StrapiError = {
  error?: { name?: string; message?: string; details?: { empty?: string[]; field?: string } };
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const payload: Record<string, string> = {};
  for (const field of FIELDS) {
    payload[field] = typeof body[field] === 'string' ? (body[field] as string).slice(0, 200) : '';
  }

  const { ok, status, data } = await strapiAuthFetch<{ jwt: string; password: string } & StrapiError>(
    '/account/register',
    { token: null, method: 'POST', body: payload }
  );

  if (!ok || !data?.jwt) {
    const details = data?.error?.details;
    if (details?.empty?.length) {
      return NextResponse.json({ error: 'empty', fields: details.empty }, { status: 400 });
    }
    if (details?.field === 'email') {
      // и «такой email уже есть», и «email кривой» — в старой модалке это одно сообщение
      const taken = data?.error?.name === 'ApplicationError';
      return NextResponse.json(
        taken ? { error: 'email' } : { error: 'empty', fields: ['email'] },
        { status: 400 }
      );
    }
    console.error('register: Strapi ответил', status, JSON.stringify(data?.error ?? null));
    return NextResponse.json({ error: 'server' }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true, password: data.password });
  response.cookies.set(AUTH_COOKIE, data.jwt, authCookieOptions);
  return response;
}
