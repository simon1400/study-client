'use client';

import { useEffect } from 'react';

/**
 * Появление блоков при прокрутке. Ставится один раз на страницу и сам находит
 * все элементы с атрибутом `data-reveal` — размечать можно в серверных
 * компонентах, не превращая их в клиентские.
 *
 * Правила показа лежат в ds.css (секция «Движение»): пока у `<html>` нет
 * `data-motion`, ничего не скрывается — сайт без JS остаётся читаемым.
 */
export default function MotionReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    const show = (node: Element) => node.classList.add('is-in');

    // Без IntersectionObserver или при «уменьшить движение» просто показываем всё.
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      nodes.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      // чуть раньше нижней кромки экрана, чтобы блок «встречал» пользователя
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}
