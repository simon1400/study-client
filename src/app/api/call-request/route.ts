import { NextResponse } from 'next/server';

/**
 * Заявка на звонок с главной. Раньше это была Netlify-лямбда callCreate:
 * писала в Mongo и слала письмо админу. Сейчас пишем в Strapi (call-request);
 * письмо через Resend добавляется на этапе 6.
 */
const STRAPI_URL = (process.env.STRAPI_URL ?? 'https://admin.studycz.cz').replace(/\/$/, '');

export async function POST(request: Request) {
  let body: { name?: string; phone?: string; time?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  if (!name || !phone) {
    return NextResponse.json({ error: 'Заполните имя и телефон' }, { status: 400 });
  }

  const res = await fetch(`${STRAPI_URL}/api/call-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        name: name.slice(0, 200),
        phone: phone.slice(0, 50),
        time: body.time?.slice(0, 50) ?? new Date().toISOString(),
        done: false,
      },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('call-request: Strapi ответил', res.status, await res.text());
    return NextResponse.json({ error: 'Не удалось сохранить заявку' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
