import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getCollection } from '@/lib/strapi';
import type { FaqItem } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import BackButton from '@/components/BackButton';
import Accordion from '@/components/Accordion';

export const metadata: Metadata = { title: 'Ответы на вопросы' };

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const items = await getCollection<FaqItem>('faq-items', { locale: strapiLocale(locale) });

  return (
    <div id="faq">
      <section className="archive-page">
        <div className="uk-container">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-3-5@m">
              <Accordion
                items={items.map((item) => ({ id: item.id, title: item.question, html: item.answer }))}
              />
            </div>
            <div className="uk-width-1-5@m uk-visible@m">
              <BackButton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
