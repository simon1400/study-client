import qs from 'qs';
import type { StrapiMedia, StrapiResponse } from '@/types/strapi';

/** Куда ходит сервер Next.js. На VPS можно указать http://127.0.0.1:1341 в обход nginx. */
const STRAPI_URL = (process.env.STRAPI_URL ?? 'https://admin.studycz.cz').replace(/\/$/, '');

/** Публичный адрес Strapi — нужен, если картинка лежит в локальном upload-провайдере (/uploads/...). */
const STRAPI_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  process.env.STRAPI_URL ??
  'https://admin.studycz.cz'
).replace(/\/$/, '');

/** ISR: страницы живут час, публикация в Strapi сбрасывает кеш вебхуком (POST /api/revalidate). */
const REVALIDATE_SECONDS = 3600;

export type StrapiQuery = Record<string, unknown>;

export class StrapiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

/**
 * Запрос к content-api Strapi. Токен не нужен: public-роли выданы find/findOne
 * (study-strapi/scripts/setup-permissions.js), анониму отдаётся только published.
 */
export async function strapiFetch<T>(
  path: string,
  query: StrapiQuery = {},
  tags: string[] = []
): Promise<StrapiResponse<T>> {
  const search = qs.stringify(query, { encodeValuesOnly: true });
  const url = `${STRAPI_URL}/api/${path}${search ? `?${search}` : ''}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: REVALIDATE_SECONDS, tags: ['strapi', ...tags] },
  });

  if (!res.ok) {
    throw new StrapiError(`Strapi ${res.status} ${res.statusText}`, res.status, path);
  }

  return (await res.json()) as StrapiResponse<T>;
}

/** Коллекция целиком (со стандартной сортировкой по order, как на старом сайте). */
export async function getCollection<T>(
  plural: string,
  { locale, query = {} }: { locale: string; query?: StrapiQuery }
): Promise<T[]> {
  const { data } = await strapiFetch<T[]>(
    plural,
    {
      locale,
      sort: ['order:asc'],
      pagination: { pageSize: 100 },
      ...query,
    },
    [plural]
  );
  return data ?? [];
}

/** Одна запись коллекции по slug. `null`, если не нашлась. */
export async function getBySlug<T>(
  plural: string,
  slug: string,
  { locale, query = {} }: { locale: string; query?: StrapiQuery }
): Promise<T | null> {
  const { data } = await strapiFetch<T[]>(
    plural,
    {
      locale,
      filters: { slug: { $eq: slug } },
      pagination: { pageSize: 1 },
      ...query,
    },
    [plural, `${plural}:${slug}`]
  );
  return data?.[0] ?? null;
}

/** Single type (homepage, global, contacts-page). */
export async function getSingle<T>(
  singular: string,
  { locale, query = {} }: { locale: string; query?: StrapiQuery }
): Promise<T | null> {
  const { data } = await strapiFetch<T | null>(singular, { locale, ...query }, [singular]);
  return data ?? null;
}

/**
 * Абсолютный URL картинки: ImageKit отдаёт полный, локальный провайдер — относительный.
 * width/height превращаются в трансформацию ImageKit (`tr=w-…,h-…`) — так же, как
 * старый сайт resize'ил через image-url Sanity.
 */
export function mediaUrl(
  media: StrapiMedia | null | undefined,
  size?: { width?: number; height?: number }
): string | null {
  if (!media?.url) return null;
  const url = media.url.startsWith('http') ? media.url : `${STRAPI_PUBLIC_URL}${media.url}`;

  const tr = [
    size?.width ? `w-${size.width}` : null,
    size?.height ? `h-${size.height}` : null,
  ].filter(Boolean);

  if (!tr.length || !url.includes('ik.imagekit.io')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}tr=${tr.join(',')}`;
}
