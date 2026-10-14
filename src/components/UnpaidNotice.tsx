'use client';

import { useEffect } from 'react';

/**
 * ВРЕМЕННО. Экран «сайт временно недоступен»: рендерится сразу вместе со
 * страницей (есть и в серверном HTML), плавно проявляется и закрывает контент
 * переливающимся полупрозрачным экраном, прокрутка под ним заблокирована.
 * Снять — удалить этот файл и строку `<UnpaidNotice />` в
 * `app/[locale]/(site)/page.tsx`.
 */
export default function UnpaidNotice() {
  // пока экран показан, страницу под ним не прокрутить
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previous;
    };
  }, []);

  return (
    <div className="unpaid" role="dialog" aria-modal="true" aria-labelledby="unpaid-title">
      <style>{css}</style>
      <div className="unpaid-card">
        <div className="unpaid-eyebrow">Повідомлення від розробника · Сообщение от разработчика</div>

        <h2 id="unpaid-title" className="unpaid-title">
          Сайт тимчасово недоступний
        </h2>
        <p className="unpaid-text">
          Доступ до вмісту сайту призупинено. Власнику сайту: для відновлення роботи
          зв&apos;яжіться з розробником.
        </p>

        <hr className="unpaid-rule" />

        <h2 className="unpaid-title">Сайт временно недоступен</h2>
        <p className="unpaid-text">
          Доступ к содержимому сайта приостановлен. Владельцу сайта: для возобновления работы
          свяжитесь с разработчиком.
        </p>
      </div>
    </div>
  );
}

/* Стили лежат здесь же, а не в ds.css: уведомление временное и снимается одним файлом. */
const css = `
.unpaid {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  overflow-y: auto;
  -webkit-backdrop-filter: blur(16px) saturate(0.4);
  backdrop-filter: blur(16px) saturate(0.4);
  background: linear-gradient(
    125deg,
    rgb(11 14 44 / 0.94) 0%,
    rgb(36 52 232 / 0.88) 25%,
    rgb(11 14 44 / 0.94) 50%,
    rgb(26 39 196 / 0.88) 75%,
    rgb(11 14 44 / 0.94) 100%
  );
  background-size: 400% 400%;
  animation:
    unpaid-in 0.9s ease both,
    unpaid-shimmer 9s ease-in-out infinite;
}
.unpaid-card {
  width: 100%;
  max-width: 560px;
  margin: auto;
  padding: 36px 32px;
  border-radius: 24px;
  border: 1px solid rgb(255 255 255 / 0.18);
  background: rgb(255 255 255 / 0.07);
  box-shadow: 0 24px 60px rgb(0 0 0 / 0.35);
  color: #fff;
  text-align: center;
  animation: unpaid-card-in 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.unpaid-eyebrow {
  margin-bottom: 20px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.6);
}
.unpaid-title {
  margin: 0 0 12px;
  font-family: var(--font-display, var(--font-sans, sans-serif));
  font-size: 30px;
  line-height: 1.15;
  font-weight: 700;
  color: #ffd43a;
  background: linear-gradient(90deg, #ffd43a 0%, #fff8d6 35%, #ffd43a 60%, #f5c518 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: unpaid-shine 4s linear infinite;
}
.unpaid-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
  color: rgb(255 255 255 / 0.88);
}
.unpaid-rule {
  margin: 26px auto;
  width: 64px;
  height: 1px;
  border: 0;
  background: rgb(255 255 255 / 0.25);
}
@media (max-width: 480px) {
  .unpaid-card { padding: 28px 20px; }
  .unpaid-title { font-size: 24px; }
  .unpaid-text { font-size: 15px; }
}
@keyframes unpaid-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes unpaid-card-in {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
@keyframes unpaid-shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes unpaid-shine {
  from { background-position: 0% 50%; }
  to { background-position: 250% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .unpaid, .unpaid-card, .unpaid-title { animation: none; }
}
`;
