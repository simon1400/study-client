/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import type { Living } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import Gallery from '@/components/Gallery';
import Html from '@/components/Html';

type Params = { locale: string; slug: string };

async function getLiving(locale: string, slug: string) {
  return getBySlug<Living>('livings', slug, {
    locale: strapiLocale(locale),
    query: { populate: { image: true, galery: true, detailedPrices: true } },
  });
}

export async function generateStaticParams() {
  const livings = await getCollection<Living>('livings', { locale: 'ru', query: { fields: ['slug'] } });
  return livings.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const living = await getLiving(locale, slug);
  return {
    title: living?.title ?? 'Проживание',
    description: living?.shortContent ?? undefined,
  };
}

export default async function LivingPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const living = await getLiving(locale, slug);
  if (!living) notFound();

  return (
    <div id="living">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@s">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@s">
              <div className="content-wrap">
                <div className="top-img-with-gallary">
                  <div className="top-img uk-cover-container">
                    <img
                      src={mediaUrl(living.image, { width: 990, height: 300 }) ?? ''}
                      alt={living.title}
                      uk-cover=""
                    />
                    <div className="top-img-overlay uk-position-cover" />
                  </div>
                  <div className="with-galery-content">
                    <h1>{living.title}</h1>
                    <Gallery images={living.galery} />
                  </div>
                </div>
                <div className="content">
                  <h2>Общая информация</h2>
                  <Html html={living.content} />
                  {living.detailedPrices.length ? (
                    <>
                      <h2>Стоимость</h2>
                      <ul className="ul-positive">
                        {living.detailedPrices.map((item) => (
                          <li key={item.id}>{item.text}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
                <div className="content-footer uk-text-center uk-text-right@s">
                  <a href="mailto:info@studycz.cz">Задать вопрос</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
