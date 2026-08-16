/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import { absoluteUrl, localeAlternates, localePath, ogBase, ORGANIZATION_ID, getSeoMeta, withSeoOverrides } from '@/lib/seo';
import type { Article } from '@/types/strapi';
import Html from '@/components/Html';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CtaBand from '@/components/ui/CtaBand';

type Params = { locale: string; slug: string };

async function getArticle(locale: string, slug: string) {
  return getBySlug<Article>('articles', slug, {
    locale: strapiLocale(locale),
    query: { populate: { image: true } },
  });
}

export async function generateStaticParams() {
  const articles = await getCollection<Article>('articles', {
    locale: 'ru',
    query: { fields: ['slug'] },
  });
  return articles.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);
  const path = `/blog/${slug}`;
  const cover = mediaUrl(article?.image, { width: 1200, height: 630 });

  return withSeoOverrides(
    {
      title: article?.title ?? 'Article',
      description: article?.shortContent ?? undefined,
      alternates: localeAlternates(locale, path),
      openGraph: {
        ...(await ogBase(locale)),
        type: 'article',
        title: article?.title ?? undefined,
        description: article?.shortContent ?? undefined,
        url: localePath(locale, path),
        // без обложки статьи Next возьмёт дефолтную из корневого layout
        images: cover ? [cover] : undefined,
        publishedTime: article?.publishedAt ?? undefined,
        modifiedTime: article?.updatedAt ?? undefined,
      },
    },
    await getSeoMeta('articles', { locale, slug })
  );
}

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [article, t] = await Promise.all([getArticle(locale, slug), getTranslations({ locale })]);
  if (!article) notFound();

  const cover = mediaUrl(article.image, { width: 1200, height: 700 });
  const url = absoluteUrl(locale, `/blog/${slug}`);

  return (
    <div id="blog">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.shortContent ?? undefined,
          image: mediaUrl(article.image, { width: 1200 }) ?? undefined,
          datePublished: article.publishedAt ?? undefined,
          dateModified: article.updatedAt,
          inLanguage: locale,
          author: { '@id': ORGANIZATION_ID },
          publisher: { '@id': ORGANIZATION_ID },
          mainEntityOfPage: url,
        }}
      />
      <section className="bg-mist pt-6 pb-9 md:pt-10 md:pb-14">
        <div className="container-prose">
          <Breadcrumbs
            locale={locale}
            home={t('nav.home')}
            parent={{ href: '/blog', title: t('pages.blog.title') }}
            current={article.title}
            currentPath={`/blog/${slug}`}
          />
          <h1 className="h1-detail">{article.title}</h1>
          {article.shortContent ? <p className="lead mt-3.5">{article.shortContent}</p> : null}
        </div>
      </section>

      {cover ? (
        <div className="container-prose -mt-6">
          <div className="rounded-card h-[200px] w-full overflow-hidden md:h-[340px]">
            {/* обложка статьи — первый экран: грузим приоритетно, не лениво */}
            <img
              src={cover}
              alt={article.title}
              width={1200}
              height={700}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
        </div>
      ) : null}

      <section className="pt-10 pb-11 md:pt-12 md:pb-[88px]">
        <div className="container-prose">
          <Html html={article.content} className="prose-ds" />

          <div className="mt-10 md:mt-11">
            <CtaBand title={t('pages.blog.ctaTitle')} text={t('pages.blog.ctaText')}>
              <Link href="/program" className="btn btn-primary btn-block !text-[15px] md:!inline-flex md:!w-auto">
                {t('pages.blog.ctaButton')}
              </Link>
            </CtaBand>
          </div>
        </div>
      </section>
    </div>
  );
}
