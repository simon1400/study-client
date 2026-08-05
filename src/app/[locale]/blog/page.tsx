/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { Article } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = { title: 'Блог' };

export default async function BlogListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // на старом сайте лента сортировалась по дате создания, но после миграции
  // у всех статей она одна и та же — порядок берём из поля order, как в Sanity
  const articles = await getCollection<Article>('articles', {
    locale: strapiLocale(locale),
    query: {
      filters: { showOnBlog: { $eq: true } },
      fields: ['title', 'slug', 'shortContent', 'order'],
      populate: { image: true },
    },
  });

  return (
    <div id="blog">
      <section className="archive-page">
        <div className="uk-container">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              <div className="blog-short">
                <div
                  className="uk-grid uk-child-width-1-1 uk-grid-match uk-child-width-1-2@s uk-child-width-1-3@m"
                  uk-height-match="target: > div > .blog-short-item > .head-short"
                >
                  {articles.map((item) => (
                    <div key={item.id}>
                      <Link href={`/blog/${item.slug}`} className="blog-short-item uk-margin-medium-bottom">
                        <h2 className="head-short">{item.title}</h2>
                        <div className="blog-short-img uk-inline uk-cover-container uk-width-1-1">
                          <img
                            className="uk-cover"
                            src={mediaUrl(item.image, { width: 300, height: 145 }) ?? ''}
                            alt={item.title}
                            uk-cover=""
                          />
                        </div>
                        <div className="blog-short-content">
                          <p>{item.shortContent}...</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
