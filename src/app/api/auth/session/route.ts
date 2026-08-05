import { NextResponse } from 'next/server';
import { getSession } from '@/lib/account';

/**
 * Кто сейчас залогинен — для шапки.
 *
 * Шапка спрашивает это с клиента, а не читает куку при рендере: `cookies()`
 * в layout выключил бы статическую генерацию всех публичных страниц (их 80).
 * Старый сайт делал то же самое, только читал localStorage.
 */
export async function GET() {
  const user = await getSession();
  return NextResponse.json(
    { user },
    { headers: { 'Cache-Control': 'no-store, private' } }
  );
}
