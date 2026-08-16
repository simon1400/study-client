import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <section className="section">
      <div className="container-prose flex flex-col items-center gap-6 py-8 text-center md:py-16">
        <div className="font-display text-blue text-[64px] leading-none font-semibold md:text-[96px]">404</div>
        <h1 className="h1-page">{t('title')}</h1>
        <Link href="/" className="btn btn-primary">
          {t('toHome')}
        </Link>
      </div>
    </section>
  );
}
