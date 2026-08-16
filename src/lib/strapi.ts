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

/**
 * Базовая локаль Strapi. Сайт четырёхъязычный, но контент переводится постепенно:
 * если в запрошенной локали записи нет, отдаём русскую — вместо пустой страницы.
 * Когда переводы появятся, поведение не изменится: фолбэк срабатывает только на пустом ответе.
 */
const FALLBACK_LOCALE = 'ru';

/**
 * 404 от Strapi — это «в этой локали записи нет» (single type без перевода) либо
 * «такого типа контента ещё нет на сервере» (тип добавлен, но Strapi не пересобран).
 * И то и другое для страницы не ошибка: секция просто не отрисуется, а локаль
 * подхватит фолбэк. Всё остальное (400, 500) по-прежнему валит рендер.
 */
async function orMissing<T>(load: () => Promise<T>, empty: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return empty;
    throw error;
  }
}

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
  const fetchIn = (loc: string) =>
    orMissing(async () => {
      const { data } = await strapiFetch<T[]>(
        plural,
        { locale: loc, sort: ['order:asc'], pagination: { pageSize: 100 }, ...query },
        [plural]
      );
      return data ?? [];
    }, [] as T[]);

  const data = await fetchIn(locale);
  if (data.length || locale === FALLBACK_LOCALE) return data;
  return fetchIn(FALLBACK_LOCALE);
}

/**
 * Коллекция целиком, без потолка в 100 записей: крутим `pagination.page`, пока
 * Strapi отдаёт полные страницы. Нужно карте сайта — `getCollection` молча режет
 * хвост, и статьи сверх сотни в sitemap.xml не попадали бы.
 */
export async function getAllPages<T>(
  plural: string,
  { locale, query = {}, pageSize = 100 }: { locale: string; query?: StrapiQuery; pageSize?: number }
): Promise<T[]> {
  const all: T[] = [];

  for (let page = 1; ; page += 1) {
    const batch = await orMissing(async () => {
      const { data } = await strapiFetch<T[]>(
        plural,
        { locale, sort: ['order:asc'], pagination: { page, pageSize }, ...query },
        [plural]
      );
      return data ?? [];
    }, [] as T[]);

    all.push(...batch);
    // защита от бесконечного цикла, если Strapi однажды перестанет уважать pagination
    if (batch.length < pageSize || page > 50) break;
  }

  return all;
}

/** Одна запись коллекции по slug. `null`, если не нашлась. */
export async function getBySlug<T>(
  plural: string,
  slug: string,
  { locale, query = {} }: { locale: string; query?: StrapiQuery }
): Promise<T | null> {
  const fetchIn = (loc: string) =>
    orMissing(async () => {
      const { data } = await strapiFetch<T[]>(
        plural,
        { locale: loc, filters: { slug: { $eq: slug } }, pagination: { pageSize: 1 }, ...query },
        [plural, `${plural}:${slug}`]
      );
      return data?.[0] ?? null;
    }, null);

  const item = await fetchIn(locale);
  if (item || locale === FALLBACK_LOCALE) return item;
  return fetchIn(FALLBACK_LOCALE);
}

/** Single type (homepage, global, contacts-page). */
export async function getSingle<T>(
  singular: string,
  { locale, query = {} }: { locale: string; query?: StrapiQuery }
): Promise<T | null> {
  const fetchIn = (loc: string) =>
    orMissing(async () => {
      const { data } = await strapiFetch<T | null>(singular, { locale: loc, ...query }, [singular]);
      return data ?? null;
    }, null);

  const item = await fetchIn(locale);
  if (item || locale === FALLBACK_LOCALE) return item;
  return fetchIn(FALLBACK_LOCALE);
}

/**
 * Абсолютный URL картинки: ImageKit отдаёт полный, локальный провайдер — относительный.
 * width/height превращаются в трансформацию ImageKit (`tr=w-…,h-…`) — так же, как
 * старый сайт resize'ил через image-url Sanity.
 *
 * `f-auto,q-auto` ставим всегда, даже без размеров: ImageKit сам отдаст WebP/AVIF
 * тем браузерам, что их понимают, и подберёт степень сжатия по содержимому.
 */
export function mediaUrl(
  media: StrapiMedia | null | undefined,
  size?: { width?: number; height?: number }
): string | null {
  if (!media?.url) return null;
  const url = media.url.startsWith('http') ? media.url : `${STRAPI_PUBLIC_URL}${media.url}`;

  if (!url.includes('ik.imagekit.io')) return url;

  const tr = [
    size?.width ? `w-${size.width}` : null,
    size?.height ? `h-${size.height}` : null,
    'f-auto',
    'q-auto',
  ].filter(Boolean);

  return `${url}${url.includes('?') ? '&' : '?'}tr=${tr.join(',')}`;
}
