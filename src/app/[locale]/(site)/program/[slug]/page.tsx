import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection } from '@/lib/strapi';
import { hasOption } from '@/lib/program';
import { absoluteUrl, localeAlternates, localePath, ogBase, ORGANIZATION_ID, getSeoMeta, withSeoOverrides } from '@/lib/seo';
import type { Program } from '@/types/strapi';
import Html from '@/components/Html';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CtaBand from '@/components/ui/CtaBand';
import FormCtaButton from '@/components/FormCtaButton';
import ProgramInclude, { type IncludeTab } from '@/components/program/ProgramInclude';

type Params = { locale: string; slug: string };

async function getProgram(locale: string, slug: string) {
  return getBySlug<Program>('programs', slug, {
    locale: strapiLocale(locale),
    query: {
      populate: {
        include: true,
        includeBefore: true,
        includeAfter: true,
        includeAdditional: true,
        notInclude: true,
        city: { fields: ['title'] },
      },
    },
  });
}

export async function generateStaticParams() {
  const programs = await getCollection<Program>('programs', {
    locale: 'ru',
    query: { fields: ['slug'] },
  });
  return programs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = await getProgram(locale, slug);
  const path = `/program/${slug}`;

  return withSeoOverrides(
    {
      title: program?.title ?? 'Programme',
      description: program?.shortContent ?? undefined,
      alternates: localeAlternates(locale, path),
      // своей картинки у программы в CMS нет — обложка остаётся дефолтная
      openGraph: {
        ...(await ogBase(locale)),
        title: program?.title ?? undefined,
        description: program?.shortContent ?? undefined,
        url: localePath(locale, path),
      },
    },
    await getSeoMeta('programs', { locale, slug })
  );
}

export default async function ProgramPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [program, t] = await Promise.all([getProgram(locale, slug), getTranslations({ locale })]);
  if (!program) notFound();

  // вкладки «что входит в программу» — те же три группы, что были в Sanity
  const tabs: IncludeTab[] = [
    { id: 'before', label: t('pages.program.tabBefore'), items: program.includeBefore ?? [] },
    { id: 'after', label: t('pages.program.tabAfter'), items: program.includeAfter ?? [] },
    { id: 'additional', label: t('pages.program.tabAdditional'), items: program.includeAdditional ?? [] },
  ]
    .filter((tab) => tab.items.length)
    .map((tab) => ({ ...tab, items: tab.items.map((item) => item.text) }));

  const metrics = hasOption(program, 'program-with-parametrs') ? (program.include ?? []) : [];
  const installments = hasOption(program, 'payment-installments');

  return (
    <div id="program">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: program.title,
          description: program.shortContent ?? undefined,
          inLanguage: locale,
          url: absoluteUrl(locale, `/program/${slug}`),
          provider: { '@id': ORGANIZATION_ID },
        }}
      />
      <section className="bg-mist pt-6 pb-9 md:pt-10 md:pb-14">
        <div className="container-page">
          <Breadcrumbs
            locale={locale}
            home={t('nav.home')}
            parent={{ href: '/program', title: t('pages.programs.title') }}
            current={program.title}
            currentPath={`/program/${slug}`}
          />

          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div>
              {program.city?.title ? <span className="badge mb-4">{program.city.title}</span> : null}
              <h1 className="h1-detail mb-4">{program.title}</h1>
              {program.shortContent ? (
                <p className="lead !text-base mb-7">{program.shortContent}</p>
              ) : null}

              {metrics.length ? (
                <div className="flex flex-wrap gap-5 md:gap-6">
                  {metrics.map((param, index) => (
                    <div key={param.id} className="flex gap-5 md:gap-6">
                      {index ? <div className="bg-line-strong w-px" /> : null}
                      <div>
                        <div className="metric !text-[22px]">{param.title}</div>
                        <div className="text-muted text-[13px]">{param.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <aside className="rounded-panel border border-line bg-white p-6 md:px-[30px] md:py-7">
              <div className="text-muted text-[13px]">{t('pages.program.priceLabel')}</div>
              <div className="font-display text-ink mt-1 mb-0.5 text-[26px] font-semibold md:text-[30px]">
                {program.price || t('common.onRequest')}
              </div>
              {installments ? (
                <div className="text-faint mb-5 text-[13px]">{t('pages.programs.installments')}</div>
              ) : (
                <div className="mb-5" />
              )}

              <FormCtaButton className="btn btn-primary btn-block !text-[15px]" />
              <Link href="/#call" className="btn btn-compact btn-block mt-2.5">
                {t('cta.ask')}
              </Link>

              <p className="text-muted mt-[18px] border-t border-line pt-4 text-[13px]">
                {t('pages.program.priceNote')}
              </p>
            </aside>
          </div>
        </div>
      </section>

      {program.content ? (
        <section className="pt-10 md:pt-16">
          <div className="container-prose">
            <Html html={program.content} className="prose-ds" />
          </div>
        </section>
      ) : null}

      {tabs.length ? (
        <section className="pt-10 md:pt-16">
          <div className="container-prose">
            <h2 className="h2-sub mb-6">{t('pages.program.includeTitle')}</h2>
            <ProgramInclude tabs={tabs} />
          </div>
        </section>
      ) : null}

      {program.notInclude?.length ? (
        <section className="pt-8 md:pt-12">
          <div className="container-prose">
            <h2 className="h2-sub mb-5">{t('pages.program.notIncluded')}</h2>
            <div className="grid gap-2.5">
              {program.notInclude.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 rounded-2xl border border-line px-5 py-4"
                >
                  <span className="text-danger mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger-bg text-xs font-bold">
                    ✕
                  </span>
                  <span className="text-body text-[15px]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container-page">
          <CtaBand title={t('pages.program.ctaTitle')} text={t('pages.program.ctaText')}>
            <Link href="/program" className="btn btn-ghost-ink btn-block md:!inline-flex md:!w-auto">
              {t('pages.program.allPrograms')}
            </Link>
            <Link href="/#call" className="btn btn-primary btn-block !text-[15px] md:!inline-flex md:!w-auto">
              {t('cta.call')}
            </Link>
          </CtaBand>
        </div>
      </section>
    </div>
  );
}
