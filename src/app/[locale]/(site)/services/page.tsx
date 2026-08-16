import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getCollection } from '@/lib/strapi';
import type { Service } from '@/types/strapi';
import Html from '@/components/Html';
import PageHero from '@/components/ui/PageHero';
import AccordionList from '@/components/ui/AccordionList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.services' });
  return { title: t('title'), description: t('lead') };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [services, t] = await Promise.all([
    getCollection<Service>('services', { locale: strapiLocale(locale) }),
    getTranslations({ locale }),
  ]);

  return (
    <div id="service">
      <PageHero
        eyebrow={t('pages.services.eyebrow')}
        title={t('pages.services.title')}
        lead={t('pages.services.lead')}
      />

      <section className="section">
        <div className="container-prose">
          <AccordionList
            items={services.map((item) => ({
              id: item.id,
              title: item.title,
              content: <Html html={item.description} className="prose-ds !text-[15px]" />,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
