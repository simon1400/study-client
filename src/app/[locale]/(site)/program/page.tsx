/* eslint-disable @next/next/no-img-element -- иконки-статика из public/ikony */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection } from '@/lib/strapi';
import { hasOption } from '@/lib/program';
import type { Program } from '@/types/strapi';
import PageHero from '@/components/ui/PageHero';
import CtaBand from '@/components/ui/CtaBand';
import CityFilterGrid from '@/components/ui/CityFilterGrid';
import { uniqueCities } from '@/lib/cities';

const ICONS = [
  '/ikony/nova-ikona-01-new.svg',
  '/ikony/nova-ikona-02-new.svg',
  '/ikony/nova-ikona-03-new.svg',
  '/ikony/nova-ikona-04-new.svg',
  '/ikony/nova-ikona-05-new.svg',
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.programs' });
  return { title: t('title'), description: t('lead') };
}

export default async function ProgramListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [programs, t] = await Promise.all([
    getCollection<Program>('programs', {
      locale: strapiLocale(locale),
      query: {
        fields: ['title', 'slug', 'shortContent', 'price', 'order', 'options'],
        populate: { city: { fields: ['title'] } },
      },
    }),
    getTranslations({ locale }),
  ]);

  const cards = programs.map((item, index) => ({
    id: item.id,
    city: item.city?.title ?? null,
    node: (
      <div className="card flex flex-col">
        <div className="mb-5 flex items-center justify-between">
          <span className="icon-box icon-box-lg">
            <img src={ICONS[index % ICONS.length]} alt="" className="w-[30px]" />
          </span>
          {item.city?.title ? <span className="badge">{item.city.title}</span> : null}
        </div>

        <h2 className="h3 mb-2.5">{item.title}</h2>
        <p className="text-muted mb-5 flex-1 text-sm">{item.shortContent}</p>

        {item.price ? (
          <>
            <div className="text-muted text-[13px]">{t('common.price')}</div>
            <div className="price mt-0.5">{item.price}</div>
            {hasOption(item, 'payment-installments') ? (
              <div className="text-faint mb-3 text-xs">{t('pages.programs.installments')}</div>
            ) : null}
          </>
        ) : null}

        <Link
          href={`/program/${item.slug}`}
          className={`btn btn-block mt-4 ${hasOption(item, 'accent') ? 'btn-primary !text-sm' : 'btn-compact'}`}
        >
          {t('common.readMore')}
        </Link>
      </div>
    ),
  }));

  return (
    <div id="programs">
      <PageHero
        eyebrow={t('pages.programs.eyebrow')}
        title={t('pages.programs.title')}
        lead={t('pages.programs.lead')}
      />

      <section className="section">
        <div className="container-page">
          <CityFilterGrid
            cities={uniqueCities(programs)}
            items={cards}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          />

          <div className="mt-10 md:mt-12">
            <CtaBand title={t('pages.programs.ctaTitle')} text={t('pages.programs.ctaText')}>
              <Link href="/#call" className="btn btn-primary btn-block md:!inline-flex md:!w-auto">
                {t('cta.call')}
              </Link>
            </CtaBand>
          </div>
        </div>
      </section>
    </div>
  );
}
