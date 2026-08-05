import { NextResponse } from 'next/server';
import { getToken, strapiAuthFetch, type AccountUser } from '@/lib/account';

/**
 * Сохранение одного шага анкеты (старая лямбда `updateQuestion.js`).
 * Куда двигать прогресс, решает Strapi: клиент присылает только номер шага и данные.
 */
export async function PUT(request: Request) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { step?: number; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const step = Number(body.step);
  if (!Number.isInteger(step) || step < 1 || step > 6) {
    return NextResponse.json({ error: 'Неизвестный шаг анкеты' }, { status: 400 });
  }
  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return NextResponse.json({ error: 'Пустые данные шага' }, { status: 400 });
  }

  const { ok, status, data } = await strapiAuthFetch<{ user: AccountUser }>('/account/questionnaire', {
    token,
    method: 'PUT',
    body: { step, data: body.data },
  });

  if (!ok || !data?.user) {
    console.error('questionnaire: Strapi ответил', status);
    return NextResponse.json({ error: 'Не удалось сохранить шаг' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, user: data.user });
}
