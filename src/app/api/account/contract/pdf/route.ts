import { getToken } from '@/lib/account';

const STRAPI_URL = (process.env.STRAPI_URL ?? 'https://admin.studycz.cz').replace(/\/$/, '');

/**
 * Копия договора в PDF: кнопка «Скачать PDF» в кабинете.
 * Файл собирает Strapi (там же, где он уходит письмом) — Next только проксирует
 * поток, подставляя токен из httpOnly-куки, чтобы браузер его не видел.
 */
export async function GET(request: Request) {
  const token = await getToken();
  if (!token) return new Response('Unauthorized', { status: 401 });

  const locale = new URL(request.url).searchParams.get('locale') || 'ru';
  const res = await fetch(
    `${STRAPI_URL}/api/account/contract/pdf?locale=${encodeURIComponent(locale)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );

  if (!res.ok || !res.body) {
    console.error('contract-pdf: Strapi ответил', res.status);
    return new Response('Not found', { status: res.status === 404 ? 404 : 502 });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': res.headers.get('content-disposition') ?? 'attachment; filename="contract.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
