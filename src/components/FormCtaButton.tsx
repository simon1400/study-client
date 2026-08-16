'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import { useRegistration } from '@/components/auth/RegistrationProvider';

/**
 * Кнопка «Заполнить анкету». Гостя открывает модалку заявки, вошедшего ведёт
 * на его шаг анкеты — та же логика, что была в шапке старого сайта.
 */
export default function FormCtaButton({ className = 'btn btn-primary' }: { className?: string }) {
  const t = useTranslations();
  const { user } = useSession();
  const registration = useRegistration();

  if (user) {
    return (
      <Link href={`/user/questionnaire/step-${user.stepQuestionare ?? 1}`} className={className}>
        {t('cta.form')}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={registration.open}>
      {t('cta.form')}
    </button>
  );
}
