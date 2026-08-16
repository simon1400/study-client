'use client';

import { useEffect, useRef, useState } from 'react';

/** Разбор значения из CMS: «30+», «1 500 €», «4,9» — цифры отдельно, оправа отдельно. */
type Parsed = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  /** в исходнике были разряды через пробел — сохраняем при анимации */
  grouped: boolean;
  /** разделитель дробной части из исходника */
  decimalMark: string;
};

// Пробел засчитываем в число только как разделитель разрядов («1 500»),
// иначе «30 лет» потеряло бы пробел перед подписью.
const NUMBER_RE = /\d+(?:\s\d{3})*(?:[.,]\d+)?/;
const NBSP = ' ';

function parse(value: string): Parsed | null {
  const match = NUMBER_RE.exec(value);
  if (!match) return null;

  const raw = match[0];
  const cleaned = raw.replace(/\s/g, '');
  const fraction = /[.,](\d+)$/.exec(cleaned);
  const target = Number(cleaned.replace(',', '.'));
  if (!Number.isFinite(target)) return null;

  return {
    prefix: value.slice(0, match.index),
    suffix: value.slice(match.index + raw.length),
    target,
    decimals: fraction ? fraction[1].length : 0,
    grouped: /\s/.test(raw),
    decimalMark: cleaned.includes(',') ? ',' : '.',
  };
}

function format(n: number, p: Parsed) {
  const [int, frac] = n.toFixed(p.decimals).split('.');
  const head = p.grouped ? int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : int;
  return p.prefix + (frac ? head + p.decimalMark + frac : head) + p.suffix;
}

/**
 * Мягкий разгон и мягкое торможение. Именно так, а не «резкий старт + затухание»:
 * у маленьких чисел (7, 13, 30) степенное затухание доводит счётчик почти до
 * значения за первую четверть времени, и роста уже не видно.
 */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const DURATION = 3000;

/**
 * Цифра, которая набегает от нуля, когда попадает в поле зрения.
 * Значение приходит строкой из Strapi, поэтому «+», «€» и прочая оправа
 * остаются на месте — анимируется только числовая часть.
 */
export default function CountUp({
  value,
  className,
  delay = 0,
}: {
  value: string;
  className?: string;
  /** задержка старта, мс — чтобы цифры в ряду запускались не разом */
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // на сервере и при первом рендере — готовое значение: без скачка разметки и потерь для поиска
  const [text, setText] = useState(value);

  useEffect(() => {
    const node = ref.current;
    const parsed = parse(value);
    if (!node || !parsed) return;

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let frame = 0;
    let timer = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / DURATION);
      setText(format(parsed.target * ease(progress), parsed));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setText(format(0, parsed));
        timer = window.setTimeout(() => {
          frame = requestAnimationFrame(step);
        }, delay);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, delay]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
