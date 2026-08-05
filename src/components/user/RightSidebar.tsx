'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { STEP_NUMBERS, STEP_TITLES } from '@/lib/questionnaire';
import '@/styles/legacy/user-right-sidebar.scss';

/** Навигация по шагам анкеты справа — старый `routes/user/components/right-sidebar`. */
export default function RightSidebar() {
  const current = usePathname().split('/').pop();

  return (
    <div className="right_sidebar">
      <nav>
        <ul>
          {STEP_NUMBERS.map((step) => (
            <li key={step} className={current === `step-${step}` ? 'nav_right_active' : ''}>
              <Link href={`/user/questionnaire/step-${step}`}>
                {step}. {STEP_TITLES[step]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="info_block">
        <h3>Возникли трудности с анкетой?</h3>
        <p>
          <a href="mailto:info@studycz.cz">Напишите нам</a> или{' '}
          <a href="#modal-call" uk-toggle="">
            закажите звонок
          </a>{' '}
          и мы проконсультируем по любому интересующему Вас вопросу в кратчайшие сроки.
        </p>
      </div>
    </div>
  );
}
