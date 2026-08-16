import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import { localeAlternates, localePath, ogBase, getSeoMeta, withSeoOverrides } from '@/lib/seo';
import type { Living } from '@/types/strapi';
import Html from '@/components/Html';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PhotoGrid from '@/components/ui/PhotoGrid';
import FormCtaButton from '@/components/FormCtaButton';

type Params = { locale: string; slug: string };

async function getLiving(locale: string, slug: string) {
  return getBySlug<Living>('livings', slug, {
    locale: strapiLocale(locale),
    query: {
      populate: {
        image: true,
        galery: true,
        detailedPrices: true,
        city: { fields: ['title'] },
      },
    },
  });
}

export async function generateStaticParams() {
  const livings = await getCollection<Living>('livings', { locale: 'ru', query: { fields: ['slug'] } });
  return livings.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const living = await getLiving(locale, slug);
  const path = `/living/${slug}`;
  const cover = mediaUrl(living?.image, { width: 1200, height: 630 });

  return withSeoOverrides(
    {
      title: living?.title ?? 'Living',
      description: living?.shortContent ?? undefined,
      alternates: localeAlternates(locale, path),
      openGraph: {
        ...(await ogBase(locale)),
        title: living?.title ?? undefined,
        description: living?.shortContent ?? undefined,
        url: localePath(locale, path),
        // без своей картинки останется дефолтная обложка из корневого layout
        images: cover ? [cover] : undefined,
      },
    },
    await getSeoMeta('livings', { locale, slug })
  );
}

export default async function LivingPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [living, t] = await Promise.all([getLiving(locale, slug), getTranslations({ locale })]);
  if (!living) notFound();

  return (
    <div id="living">
      <section className="bg-mist pt-6 pb-9 md:pt-10 md:pb-14">
        <div className="container-page">
          <Breadcrumbs
            locale={locale}
            home={t('nav.home')}
            parent={{ href: '/living', title: t('pages.living.title') }}
            current={living.city?.title}
            currentPath={`/living/${slug}`}
          />
          <h1 className="h1-detail mb-6 md:mb-7">{living.title}</h1>
          <PhotoGrid images={[living.image, ...(living.galery ?? [])]} alt={living.title} />
        </div>
      </section>

      <section className="section">
        <div className="container-page grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:gap-14">
          <div>
            <h2 className="h2-sub mb-4 md:mb-[18px]">{t('pages.living.info')}</h2>
            <Html html={living.content} className="prose-ds" />
          </div>

          {/* правая колонка с ценами — sticky, как в макете «Общежитие — деталь» */}
          <aside className="rounded-card bg-mist border border-line p-6 md:p-7 lg:sticky lg:top-24">
            <h3 className="text-ink mb-4 text-[17px] font-semibold md:mb-[18px]">{t('common.price')}</h3>

            {living.detailedPrices?.length ? (
              <div className="mb-5 flex flex-col gap-3">
                {living.detailedPrices.map((item) => (
                  <div key={item.id} className="border-b border-line pb-2.5 text-sm">
                    {item.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="price mb-5">{living.price || t('common.onRequest')}</div>
            )}

            <div className="text-faint mb-4 text-xs md:mb-[18px]">{t('pages.programs.installments')}</div>
            <FormCtaButton className="btn btn-primary btn-block !text-[15px]" />
          </aside>
        </div>
      </section>
    </div>
  );
}
