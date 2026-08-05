import { cookies } from 'next/headers';
import { AUTH_COOKIE } from './auth-cookie';
import type { Questionnaire } from './questionnaire';
import type { AccountUser } from '@/types/account';

export type { AccountUser };

/**
 * Личный кабинет: всё общение со Strapi идёт отсюда, с сервера Next.js.
 * Браузер токена не видит — он лежит в httpOnly-куке, а страницы и роут-хендлеры
 * подставляют его в заголовок Authorization.
 *
 * Эндпоинты — кастомный `account`-API в study-strapi (src/api/account):
 * профиль и анкета всегда берутся по `ctx.state.user`, id в запросе не передаётся,
 * поэтому дотянуться до чужой анкеты нельзя.
 */

const STRAPI_URL = (process.env.STRAPI_URL ?? 'https://admin.studycz.cz').replace(/\/$/, '');

export type StrapiResult<T> = { ok: boolean; status: number; data: T | null };

/** Запрос к Strapi от имени пользователя. Без кеша: ЛК всегда показывает актуальное. */
export async function strapiAuthFetch<T>(
  path: string,
  {
    token,
    method = 'GET',
    body,
  }: { token: string | null; method?: string; body?: unknown }
): Promise<StrapiResult<T>> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null;
  }

  return { ok: res.ok, status: res.status, data };
}

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

/**
 * Текущий пользователь или `null`, если куки нет либо токен протух/отозван.
 * Страницы `/user/*` вызывают это на каждый рендер — сессия проверяется у Strapi,
 * а не по факту наличия куки.
 */
export async function getSession(): Promise<AccountUser | null> {
  const token = await getToken();
  if (!token) return null;

  const { ok, data } = await strapiAuthFetch<{ user: AccountUser }>('/account/me', { token });
  return ok && data?.user ? data.user : null;
}

/** Профиль + анкета одним запросом (анкета заводится на сервере, если её ещё нет). */
export async function getQuestionnaire(): Promise<{
  user: AccountUser;
  questionnaire: Questionnaire;
} | null> {
  const token = await getToken();
  if (!token) return null;

  const { ok, data } = await strapiAuthFetch<{ user: AccountUser; questionnaire: Questionnaire }>(
    '/account/questionnaire',
    { token }
  );
  return ok && data?.user && data.questionnaire ? data : null;
}
