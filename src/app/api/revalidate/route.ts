import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * Вебхук Strapi: при публикации/правке контента сбрасываем ISR-кеш.
 * В Strapi (Settings → Webhooks) укажите URL https://studycz.cz/api/revalidate
 * и заголовок `x-revalidate-secret` со значением REVALIDATE_SECRET.
 *
 * Тег `strapi` висит на всех запросах (см. lib/strapi.ts), так что по умолчанию
 * сбрасывается всё; можно прислать {"tags":["universities"]} и сбросить точечно.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tags: string[] = ['strapi'];
  try {
    const body = await request.json();
    if (Array.isArray(body?.tags) && body.tags.length) tags = body.tags;
  } catch {
    // Strapi шлёт своё тело события — нам достаточно сбросить всё
  }

  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ revalidated: tags });
}
