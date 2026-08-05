/**
 * Имя и параметры куки с JWT.
 *
 * Отдельный модуль, потому что его импортирует и middleware (edge-runtime,
 * `next/headers` там недоступен), и серверные хелперы `lib/account.ts`.
 */

export const AUTH_COOKIE = 'studycz_jwt';

/** Столько же живёт JWT Strapi (`config/plugins.ts`, jwt.expiresIn = 30d). */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * httpOnly — токен не виден из JS, поэтому XSS его не утащит (в отличие от
 * localStorage, где он лежал на старом сайте).
 * secure — только по https; на localhost отключаем, иначе кука не ставится.
 */
export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: AUTH_COOKIE_MAX_AGE,
} as const;
