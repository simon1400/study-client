import { NextResponse } from 'next/server';
import { strapiAuthFetch } from '@/lib/account';

/**
 * «Забыли пароль»: Strapi шлёт письмо со ссылкой на `/reset-password?code=…`
 * (адрес задаётся скриптом `study-strapi/scripts/setup-email.js`).
 *
 * Ответ всегда одинаковый, есть такой email или нет: иначе форма превращается
 * в способ проверять, кто зарегистрирован на сайте. Сам Strapi ведёт себя так же.
 */
export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: 'empty' }, { status: 400 });
  }

  const { ok, status } = await strapiAuthFetch('/auth/forgot-password', {
    token: null,
    method: 'POST',
    body: { email },
  });

  if (!ok) {
    console.error('forgot-password: Strapi ответил', status);
  }

  return NextResponse.json({ ok: true });
}
