/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import { localeAlternates } from '@/lib/seo';
import type { University } from '@/types/strapi';
import PageHero from '@/components/ui/PageHero';
import CityFilterGrid from '@/components/ui/CityFilterGrid';
import { uniqueCities } from '@/lib/cities';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.universities' });
  return {
    title: t('title'),
    description: t('lead'),
    alternates: localeAlternates(locale, '/university'),
  };
}

export default async function UniversityListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [universities, t] = await Promise.all([
    getCollection<University>('universities', {
      locale: strapiLocale(locale),
      query: {
        fields: ['title', 'slug', 'shortContent', 'order'],
        populate: { image: true, city: { fields: ['title'] } },
      },
    }),
    getTranslations({ locale }),
  ]);

  const cards = universities.map((item) => ({
    id: item.id,
    city: item.city?.title ?? null,
    node: (
      <article className="card-media">
        <Link href={`/university/${item.slug}`} className="block h-[200px] w-full md:h-[220px]">
          <img
            src={mediaUrl(item.image, { width: 640, height: 440 }) ?? ''}
            alt={item.title}
            width={640}
            height={440}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
        <div className="flex flex-1 flex-col p-6 md:p-[26px]">
          <h2 className="h3 mb-2.5 md:!text-[19px]">
            <Link href={`/university/${item.slug}`} className="text-ink hover:text-blue">
              {item.title}
            </Link>
          </h2>
          <p className="text-muted mb-5 flex-1 text-sm">{item.shortContent}</p>
          <div className="flex items-center justify-between gap-3">
            {item.city?.title ? <span className="badge">{item.city.title}</span> : <span />}
            <Link href={`/university/${item.slug}`} className="link-more !text-sm">
              {t('common.readMore')} →
            </Link>
          </div>
        </div>
      </article>
    ),
  }));

  return (
    <div id="university">
      <PageHero
        eyebrow={t('pages.universities.eyebrow')}
        title={t('pages.universities.title')}
        lead={t('pages.universities.lead')}
      />

      <section className="section">
        <div className="container-page">
          <CityFilterGrid cities={uniqueCities(universities)} items={cards} />
        </div>
      </section>
    </div>
  );
}
