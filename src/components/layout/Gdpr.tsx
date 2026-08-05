'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import '@/styles/legacy/gdpr.scss';

export default function Gdpr() {
  // до чтения localStorage баннер не показываем, чтобы не мигал при гидрации
  const [agree, setAgree] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('agree_gdpr')) setAgree(false);
  }, []);

  if (agree) return null;

  return (
    <div className="gdpr">
      <p>
        На нашем сайте используются файлы cookies. Оставаясь на сайте, Вы соглашаетесь с их
        использованием. <Link href="/blog/cookies">Подробнее</Link>
        <button
          className="close-gdpr"
          type="button"
          uk-close=""
          aria-label="Закрыть"
          onClick={() => {
            localStorage.setItem('agree_gdpr', 'true');
            setAgree(true);
          }}
        />
      </p>
    </div>
  );
}
