import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import type { InfoPage } from '@/types/strapi';
import Html from '@/components/Html';
import PageHero from '@/components/ui/PageHero';

type Params = { locale: string; slug: string };

/**
 * Технические и юридические страницы из коллекции `page` (защита персональных
 * данных, оферта, условия). Адрес — прямо в корне: `/privacy`, `/terms` и так далее.
 *
 * Статические разделы сайта (`/program`, `/blog`, …) в маршрутизации Next всегда
 * выигрывают у динамического сегмента, поэтому конфликта нет; неизвестный slug
 * отдаёт 404. Новую страницу достаточно завести в админке — деплой не нужен.
 */
async function getPage(locale: string, slug: string) {
  return getBySlug<InfoPage>('pages', slug, {
    locale: strapiLocale(locale),
    query: { populate: '*' },
  });
}

export async function generateStaticParams() {
  const pages = await getCollection<InfoPage>('pages', {
    locale: 'ru',
    query: { fields: ['slug'] },
  });
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(locale, slug);
  if (!page) return {};
  return { title: page.title, description: page.lead ?? undefined };
}

export default async function InfoPageRoute({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [page, t] = await Promise.all([getPage(locale, slug), getTranslations({ locale })]);
  if (!page) notFound();

  const file = mediaUrl(page.attachmentFile);

  return (
    <div id="info-page">
      <PageHero eyebrow={page.eyebrow ?? undefined} title={page.title} lead={page.lead} />

      <section className="section">
        <div className="container-prose">
          <Html html={page.content} className="prose-ds" />

          {page.attachmentTitle ? (
            <div className="bg-mist mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-line px-6 py-5 md:mt-10">
              <div>
                <div className="text-ink font-semibold">{page.attachmentTitle}</div>
                {page.attachmentSubtitle ? (
                  <div className="text-muted text-sm">{page.attachmentSubtitle}</div>
                ) : null}
              </div>
              {file ? (
                <a href={file} target="_blank" rel="noreferrer noopener" className="btn btn-compact !px-6 !py-3">
                  {t('pages.info.download')}
                </a>
              ) : null}
            </div>
          ) : null}

          {page.note ? <p className="note mt-8 md:mt-10">{page.note}</p> : null}
        </div>
      </section>
    </div>
  );
}
