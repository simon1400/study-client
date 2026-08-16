import { Golos_Text, Unbounded } from 'next/font/google';

/**
 * Шрифты редизайна (стайлгайд, §02): заголовки — Unbounded, текст и UI — Golos Text.
 * Обе с кириллицей. Подключены через next/font — self-hosted, без запроса к fonts.googleapis.com.
 * CSS-переменные читает `--font-display` / `--font-sans` в src/styles/ds.css.
 */
export const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
});

export const golos = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-golos',
  display: 'swap',
});

/** Классы обеих переменных — вешаются на <html>. */
export const fontVariables = `${unbounded.variable} ${golos.variable}`;
