/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { Article } from '@/types/strapi';
import PageHero from '@/components/ui/PageHero';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.blog' });
  return { title: t('title'), description: t('lead') };
}

export default async function BlogListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // на старом сайте лента сортировалась по дате создания, но после миграции
  // у всех статей она одна и та же — порядок берём из поля order, как в Sanity
  const [articles, t] = await Promise.all([
    getCollection<Article>('articles', {
      locale: strapiLocale(locale),
      query: {
        filters: { showOnBlog: { $eq: true } },
        fields: ['title', 'slug', 'shortContent', 'order'],
        populate: { image: true },
      },
    }),
    getTranslations({ locale }),
  ]);

  return (
    <div id="blog">
      <PageHero
        eyebrow={t('pages.blog.eyebrow')}
        title={t('pages.blog.title')}
        lead={t('pages.blog.lead')}
      />

      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {articles.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="card-media text-body">
                <div className="h-[180px] w-full">
                  <img
                    src={mediaUrl(item.image, { width: 560, height: 360 }) ?? ''}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-5 pb-6 md:px-6">
                  <h2 className="h3 !text-[17px] leading-snug">{item.title}</h2>
                  <p className="text-muted m-0 flex-1 text-sm">{item.shortContent}</p>
                  <span className="text-blue text-sm font-semibold">{t('common.read')} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
