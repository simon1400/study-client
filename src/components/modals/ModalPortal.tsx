'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Все модалки рендерятся порталом в `<body>`.
 *
 * UIkit при показе переносит модалку в конец body (миксин Container). Если
 * React считает её родителем свой div, то при размонтировании — например, при
 * уходе со страницы — он зовёт `removeChild` у уже не-родителя и роняет
 * приложение с `NotFoundError`. Портал делает body родителем и для React,
 * так что перенос UIkit больше ничего не ломает.
 *
 * Побочный эффект: в серверном HTML модалок нет, они появляются после гидрации.
 * Для интерактивных окон это нормально — до JS они всё равно не открываются.
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
