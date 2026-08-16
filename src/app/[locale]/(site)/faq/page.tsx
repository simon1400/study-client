import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection } from '@/lib/strapi';
import type { FaqItem } from '@/types/strapi';
import Html from '@/components/Html';
import PageHero from '@/components/ui/PageHero';
import AccordionList from '@/components/ui/AccordionList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.faq' });
  return { title: t('title'), description: t('lead') };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [items, t] = await Promise.all([
    getCollection<FaqItem>('faq-items', { locale: strapiLocale(locale) }),
    getTranslations({ locale }),
  ]);

  return (
    <div id="faq">
      <PageHero eyebrow={t('pages.faq.eyebrow')} title={t('pages.faq.title')}>
        <p className="lead max-w-[600px]">
          {t('pages.faq.lead')}{' '}
          <Link href="/#call" className="text-blue hover:text-blue-dark underline underline-offset-2">
            {t('pages.faq.leadAction')}
          </Link>
        </p>
      </PageHero>

      <section className="section">
        <div className="container-prose">
          <AccordionList
            items={items.map((item) => ({
              id: item.id,
              title: item.question,
              content: <Html html={item.answer} className="prose-ds !text-[15px]" />,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
