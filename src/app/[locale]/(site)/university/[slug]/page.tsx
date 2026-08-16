/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import { localeAlternates, localePath, ogBase, getSeoMeta, withSeoOverrides } from '@/lib/seo';
import type { University } from '@/types/strapi';
import Html from '@/components/Html';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CtaBand from '@/components/ui/CtaBand';
import PhotoGrid from '@/components/ui/PhotoGrid';
import FormCtaButton from '@/components/FormCtaButton';

type Params = { locale: string; slug: string };

async function getUniversity(locale: string, slug: string) {
  return getBySlug<University>('universities', slug, {
    locale: strapiLocale(locale),
    query: {
      populate: {
        image: true,
        galery: true,
        facultyImage: true,
        faculties: { populate: '*' },
        city: { fields: ['title'] },
      },
    },
  });
}

export async function generateStaticParams() {
  const universities = await getCollection<University>('universities', {
    locale: 'ru',
    query: { fields: ['slug'] },
  });
  return universities.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const university = await getUniversity(locale, slug);
  const path = `/university/${slug}`;
  const cover = mediaUrl(university?.image, { width: 1200, height: 630 });

  return withSeoOverrides(
    {
      title: university?.title ?? 'University',
      description: university?.shortContent ?? undefined,
      alternates: localeAlternates(locale, path),
      openGraph: {
        ...(await ogBase(locale)),
        title: university?.title ?? undefined,
        description: university?.shortContent ?? undefined,
        url: localePath(locale, path),
        // без своей картинки останется дефолтная обложка из корневого layout
        images: cover ? [cover] : undefined,
      },
    },
    await getSeoMeta('universities', { locale, slug })
  );
}

export default async function UniversityPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [university, t] = await Promise.all([getUniversity(locale, slug), getTranslations({ locale })]);
  if (!university) notFound();

  const hero = mediaUrl(university.image, { width: 900, height: 640 });

  return (
    <div id="university-full">
      <section className="bg-mist pt-6 pb-9 md:pt-10 md:pb-14">
        <div className="container-page">
          <Breadcrumbs
            locale={locale}
            home={t('nav.home')}
            parent={{ href: '/university', title: t('pages.universities.title') }}
            current={university.city?.title}
            currentPath={`/university/${slug}`}
          />

          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div>
              {university.city?.title ? <span className="badge mb-4">{university.city.title}</span> : null}
              <h1 className="h1-detail mb-4">{university.title}</h1>
              {university.shortContent ? <p className="lead !text-base">{university.shortContent}</p> : null}
            </div>
            {hero ? (
              <div className="rounded-panel h-[220px] w-full overflow-hidden md:h-[320px]">
                {/* картинка первого экрана: приоритетная загрузка, без lazy */}
                <img
                  src={hero}
                  alt={university.title}
                  width={900}
                  height={640}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {university.content ? (
        <section className="pt-10 md:pt-16">
          <div className="container-prose">
            <h2 className="h2-sub mb-4 md:mb-[18px]">{t('pages.universities.info')}</h2>
            <Html html={university.content} className="prose-ds" />
          </div>
        </section>
      ) : null}

      {university.galery?.length ? (
        <section className="pt-10 md:pt-14">
          <div className="container-page">
            <PhotoGrid images={university.galery} alt={university.title} />
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container-page">
          {university.faculties?.length ? (
            <>
              <h2 className="h2-sub mb-6 text-center md:mb-7">
                {university.facultyTitle || t('pages.universities.faculties')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {university.faculties.map((faculty) => (
                  <div key={faculty.id} className="bg-mist rounded-2xl border border-line p-5 md:p-[22px]">
                    <div className="text-ink mb-2 text-[15px] leading-snug font-semibold">{faculty.title}</div>
                    <div className="text-muted text-[13px]">
                      {faculty.specializations.map((spec) => spec.text).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <div className="mt-10 md:mt-12">
            <CtaBand
              title={t('pages.universities.ctaTitle')}
              text={t('pages.universities.ctaText')}
            >
              <Link href="/#call" className="btn btn-ghost-ink btn-block md:!inline-flex md:!w-auto">
                {t('cta.ask')}
              </Link>
              <FormCtaButton className="btn btn-primary btn-block !text-[15px] md:!inline-flex md:!w-auto" />
            </CtaBand>
          </div>
        </div>
      </section>
    </div>
  );
}
