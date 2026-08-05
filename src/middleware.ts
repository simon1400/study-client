import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { AUTH_COOKIE } from './lib/auth-cookie';

const intlMiddleware = createMiddleware(routing);

/** `/user/...` и то же самое с префиксом локали (`/uk/user/...`). */
const USER_AREA = new RegExp(`^/(?:(?:${routing.locales.join('|')})/)?user(?:/|$)`);

/**
 * Личный кабинет закрыт для анонимов. Здесь проверяется только наличие куки —
 * подпись токена смотреть нечем (секрет живёт в Strapi), поэтому настоящую
 * проверку делает layout `/user`: он спрашивает `/account/me` и при отказе
 * отправляет на главную. Middleware лишь отсекает заведомо чужих до рендера.
 */
export default function middleware(request: NextRequest) {
  if (USER_AREA.test(request.nextUrl.pathname) && !request.cookies.get(AUTH_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  // всё, кроме api-роутов, статики Next и файлов с расширением
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
