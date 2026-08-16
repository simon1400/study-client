/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { Living } from '@/types/strapi';
import PageHero from '@/components/ui/PageHero';
import CityFilterGrid from '@/components/ui/CityFilterGrid';
import { uniqueCities } from '@/lib/cities';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.living' });
  return { title: t('title'), description: t('lead') };
}

export default async function LivingListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [livings, t] = await Promise.all([
    getCollection<Living>('livings', {
      locale: strapiLocale(locale),
      query: {
        fields: ['title', 'slug', 'price', 'order'],
        populate: { image: true, benefits: true, city: { fields: ['title'] } },
      },
    }),
    getTranslations({ locale }),
  ]);

  const cards = livings.map((item) => ({
    id: item.id,
    city: item.city?.title ?? null,
    node: (
      <article className="card-media">
        <Link href={`/living/${item.slug}`} className="block h-[200px] w-full md:h-[220px]">
          <img
            src={mediaUrl(item.image, { width: 640, height: 440 }) ?? ''}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>

        <div className="flex flex-1 flex-col p-6 md:p-[26px]">
          <h2 className="h3 mb-3.5 md:!text-[19px]">
            <Link href={`/living/${item.slug}`} className="text-ink hover:text-blue">
              {item.title}
            </Link>
          </h2>

          {item.benefits?.length ? (
            <ul className="mb-5 flex flex-1 list-none flex-col gap-2 p-0">
              {item.benefits.map((benefit) => (
                <li key={benefit.id} className="text-muted flex gap-2.5 text-sm">
                  <span className="text-blue font-bold">·</span>
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex items-end justify-between gap-4 border-t border-line pt-4 md:pt-[18px]">
            <div>
              <div className="text-muted text-[13px]">{t('common.price')}</div>
              <div className="price !text-[18px]">{item.price || t('common.onRequest')}</div>
              <div className="text-faint text-xs">{t('pages.programs.installments')}</div>
            </div>
            <Link href={`/living/${item.slug}`} className="btn btn-compact shrink-0">
              {t('common.readMore')}
            </Link>
          </div>
        </div>
      </article>
    ),
  }));

  return (
    <div id="living">
      <PageHero
        eyebrow={t('pages.living.eyebrow')}
        title={t('pages.living.title')}
        lead={t('pages.living.lead')}
      />

      <section className="section">
        <div className="container-page">
          {/* фильтр городов — по просьбе пользователя такой же, как на «Университетах» */}
          <CityFilterGrid cities={uniqueCities(livings)} items={cards} />
        </div>
      </section>
    </div>
  );
}
