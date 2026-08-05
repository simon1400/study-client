import { NextResponse } from 'next/server';
import { getToken, strapiAuthFetch, type AccountUser } from '@/lib/account';

/**
 * Выбор программы обучения в ЛК (модалка `#modal-select-program`).
 * Флаг `programmSelected` и первый шаг «пути студента» проставляет Strapi —
 * клиент присылает только саму программу.
 */
export async function PUT(request: Request) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { programm?: string; price?: string; dateCourse?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!body.programm?.trim()) {
    return NextResponse.json({ error: 'Не выбрана программа' }, { status: 400 });
  }

  const { ok, status, data } = await strapiAuthFetch<{ user: AccountUser }>('/account/me', {
    token,
    method: 'PUT',
    body: {
      programm: body.programm,
      price: body.price || 'Не выбрано',
      dateCourse: body.dateCourse || 'Не выбрано',
    },
  });

  if (!ok || !data?.user) {
    console.error('select-program: Strapi ответил', status);
    return NextResponse.json({ error: 'Не удалось сохранить программу' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, user: data.user });
}
