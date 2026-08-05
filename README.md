# study-client

Фронтенд studycz.cz: Next.js 15 (App Router) + TypeScript, контент из Strapi
(репозиторий `study-strapi`, прод — https://admin.studycz.cz).

Вёрстка перенесена 1:1 со старого сайта на CRA (`simon1400/study.full`, локально `d:\studycz\src`):
UIkit 3.1.4 + те же SCSS, редизайн отложен.

## Запуск

```bash
npm install
cp .env.example .env.local   # STRAPI_URL по умолчанию смотрит на прод
npm run dev                  # http://localhost:3000
npm run build && npm start   # прод-сборка
npm run lint                 # eslint
npm run typecheck            # tsc --noEmit
```

## Как всё устроено

- `src/app/[locale]/…` — страницы. Локаль в URL появляется только для не-дефолтных
  локалей (`localePrefix: 'as-needed'`), поэтому русские адреса совпадают со старыми:
  `/`, `/program`, `/program/[slug]`, `/university`, `/university/[slug]`, `/living`,
  `/living/[slug]`, `/blog`, `/blog/[slug]`, `/agents`, `/contacts`, `/services`,
  `/faq`, `/partners`.
- `src/i18n/routing.ts` — список активных локалей. Сейчас только `ru` (в Strapi
  заполнена только она); добавление `uk`/`cz`/`en` включает остальные, `cz` в URL
  маппится на локаль `cs` в Strapi.
- `src/lib/strapi.ts` — запросы к content-api: `getCollection`, `getBySlug`,
  `getSingle`, `mediaUrl`. Токен не нужен — public-роли выданы права на чтение
  (`study-strapi/scripts/setup-permissions.js`), анониму отдаётся только published.
- Кеш: ISR на час + теги. Вебхук Strapi на `POST /api/revalidate`
  (заголовок `x-revalidate-secret`) сбрасывает кеш сразу после публикации.
- `src/types/strapi.ts` — типы контента, зеркало схем из study-strapi.
- Картинки лежат в ImageKit; размеры задаются трансформацией `?tr=w-…,h-…`
  в `mediaUrl()` — как раньше делал image-url Sanity.
- Стили: `src/styles/theme.css` — бандл старого сайта (тема + UIkit),
  `style.scss` + `legacy/*.scss` — правки поверх, `src/styles/legacy` повторяет
  постраничные стили CRA.

## Чего ещё нет (этапы 5–6)

- Авторизация, личный кабинет и анкета (`/user/*`) — блок «Войти» в шапке и
  модалки регистрации/пароля пока не переносились.
- Письма через Resend: заявка на звонок с главной сохраняется в Strapi
  (`POST /api/call-request`), но уведомление админу ещё не отправляется.
- Секция «Наша медиатека» на главной: старый Instagram API v1 отключён,
  вернём на Instagram Graph API отдельно.
