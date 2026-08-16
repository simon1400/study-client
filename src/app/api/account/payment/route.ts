import { NextResponse } from 'next/server';
import { getToken, strapiAuthFetch, type AccountUser } from '@/lib/account';

/** Смена варианта оплаты (предоплата / вся сумма) — без отметки о переводе. */
export async function PUT(request: Request) {
  return forward(request, 'PUT', '/account/payment/plan');
}

/** «Я оплатил»: ставит статус pending и уведомляет менеджера письмом. */
export async function POST(request: Request) {
  return forward(request, 'POST', '/account/payment/mark');
}

async function forward(request: Request, method: string, path: string) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { plan?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const plan = body.plan === 'full' ? 'full' : 'half';
  const locale = encodeURIComponent(body.locale || 'ru');

  const { ok, status, data } = await strapiAuthFetch<{ user: AccountUser }>(
    `${path}?locale=${locale}`,
    { token, method, body: { plan } }
  );

  if (!ok || !data?.user) {
    console.error('payment: Strapi ответил', status);
    return NextResponse.json({ error: 'Не удалось сохранить' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, user: data.user });
}
