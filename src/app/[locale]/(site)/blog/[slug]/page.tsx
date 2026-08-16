/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import type { Article } from '@/types/strapi';
import Html from '@/components/Html';
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
  return {
    title: article?.title ?? 'Article',
    description: article?.shortContent ?? undefined,
  };
}

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [article, t] = await Promise.all([getArticle(locale, slug), getTranslations({ locale })]);
  if (!article) notFound();

  const cover = mediaUrl(article.image, { width: 1200, height: 700 });

  return (
    <div id="blog">
      <section className="bg-mist pt-6 pb-9 md:pt-10 md:pb-14">
        <div className="container-prose">
          <Breadcrumbs parent={{ href: '/blog', title: t('pages.blog.title') }} />
          <h1 className="h1-detail">{article.title}</h1>
          {article.shortContent ? <p className="lead mt-3.5">{article.shortContent}</p> : null}
        </div>
      </section>

      {cover ? (
        <div className="container-prose -mt-6">
          <div className="rounded-card h-[200px] w-full overflow-hidden md:h-[340px]">
            <img src={cover} alt={article.title} className="h-full w-full object-cover" />
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
