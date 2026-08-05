/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import type { Article } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import Html from '@/components/Html';
import '@/styles/legacy/blog-full.scss';

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
    title: article?.title ?? 'Статья',
    description: article?.shortContent ?? undefined,
  };
}

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticle(locale, slug);
  if (!article) notFound();

  return (
    <div id="blog">
      <section className="archive-page">
        <div className="uk-container">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              <div className="blog-full">
                <div className="uni-info-wrap">
                  <div className="uni-info-top-img uk-cover-container uk-inline uk-width-1-1">
                    <img
                      src={mediaUrl(article.image, { width: 1000, height: 300 }) ?? ''}
                      alt={article.title}
                      uk-cover=""
                    />
                    <h1 className="uk-position-cover uk-flex uk-flex-center uk-flex-middle uk-text-center">
                      {article.title}
                    </h1>
                  </div>
                </div>

                <div className="blog-content content">
                  <Html html={article.content} />
                </div>

                {article.showOnBlog ? (
                  <div className="content-footer uk-text-center uk-text-right@s">
                    <a href="mailto:info@studycz.cz">Задать вопрос</a> или{' '}
                    <a href="#modal-registration" uk-toggle="" className="button button-accent">
                      Заполнить анкету
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
