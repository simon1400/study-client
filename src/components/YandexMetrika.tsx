'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { CONSENT_EVENT, storedConsent } from '@/lib/analytics';

/**
 * Яндекс.Метрика 53724796 — тот же счётчик, что в старом public/index.html,
 * но грузится только после согласия в gdpr-баннере: Метрика не понимает
 * google consent mode, так что «default denied» её не остановил бы.
 */

const YANDEX_METRIKA_ID = 53724796;

export default function YandexMetrika() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (storedConsent() === true) {
      setEnabled(true);
      return;
    }
    const onConsent = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) setEnabled(true);
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  if (!enabled) return null;

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${YANDEX_METRIKA_ID}, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true});`}
    </Script>
  );
}
