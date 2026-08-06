'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { saveConsent, storedConsent } from '@/lib/analytics';
import '@/styles/legacy/gdpr.scss';

export default function Gdpr() {
  // до чтения localStorage баннер не показываем, чтобы не мигал при гидрации
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (storedConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function decide(granted: boolean) {
    saveConsent(granted);
    setVisible(false);
  }

  return (
    <div className="gdpr">
      <p>
        На нашем сайте используются файлы cookies. <Link href="/blog/cookies">Подробнее</Link>
        <span className="gdpr-actions">
          <button className="uk-button uk-button-primary uk-button-small" type="button" onClick={() => decide(true)}>
            Принять
          </button>
          <button className="uk-button uk-button-default uk-button-small" type="button" onClick={() => decide(false)}>
            Отказаться
          </button>
        </span>
      </p>
    </div>
  );
}
