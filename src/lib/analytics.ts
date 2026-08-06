/**
 * Согласие на cookies (GDPR) и события аналитики. Только для клиентских компонентов.
 *
 * Ключ localStorage тот же, что был у старого баннера (`agree_gdpr`), поэтому
 * посетители, закрывшие баннер до миграции, считаются согласившимися.
 * Значения: 'true' — согласие, 'false' — отказ, нет ключа — решения ещё не было.
 *
 * Consent mode v2: default 'denied' выставляет инлайн-скрипт в layout ДО загрузки
 * GTM; здесь только 'update' по клику в баннере. Яндекс.Метрика consent mode не
 * понимает, поэтому <YandexMetrika> слушает событие CONSENT_EVENT и грузит счётчик
 * только после согласия.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const GDPR_KEY = 'agree_gdpr';
export const CONSENT_EVENT = 'gdpr-consent';

export function storedConsent(): boolean | null {
  try {
    const value = localStorage.getItem(GDPR_KEY);
    return value === 'true' ? true : value === 'false' ? false : null;
  } catch {
    return null;
  }
}

// gtag обязан пушить объект arguments, а не массив — иначе GTM не увидит consent-команду
function gtag(...args: unknown[]) {
  void args;
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

export function pushEvent(event: string, params?: Record<string, unknown>) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

export function saveConsent(granted: boolean) {
  try {
    localStorage.setItem(GDPR_KEY, String(granted));
  } catch {
    // приватный режим — решение не переживёт перезагрузку, но на эту сессию хватит
  }

  const mode = granted ? 'granted' : 'denied';
  gtag('consent', 'update', {
    ad_storage: mode,
    ad_user_data: mode,
    ad_personalization: mode,
    analytics_storage: mode,
  });
  // отдельное событие — триггер в GTM для пикселей, которым нужно явное согласие
  if (granted) pushEvent('consent_granted');

  window.dispatchEvent(new CustomEvent<boolean>(CONSENT_EVENT, { detail: granted }));
}
