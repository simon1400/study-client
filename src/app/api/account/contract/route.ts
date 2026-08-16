import { NextResponse } from 'next/server';
import { getToken, strapiAuthFetch, type AccountUser } from '@/lib/account';
import type { ContractView } from '@/types/contract';

/** Подписание договора в кабинете. Подпись, дату и IP фиксирует Strapi. */
export async function POST(request: Request) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { signature?: string; agree?: boolean; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!body.signature?.trim() || body.agree !== true) {
    return NextResponse.json({ error: 'Нужны подпись и согласие' }, { status: 400 });
  }

  const locale = encodeURIComponent(body.locale || 'ru');
  const { ok, status, data } = await strapiAuthFetch<{ user: AccountUser; contract: ContractView }>(
    `/account/contract/sign?locale=${locale}`,
    { token, method: 'POST', body: { signature: body.signature, agree: true } }
  );

  if (!ok || !data?.user) {
    console.error('sign-contract: Strapi ответил', status);
    return NextResponse.json({ error: 'Не удалось подписать договор' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, user: data.user, contract: data.contract ?? null });
}
