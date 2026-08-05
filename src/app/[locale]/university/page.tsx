/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { University } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import CityFilter, { uniqueCities } from '@/components/CityFilter';

export const metadata: Metadata = { title: 'Университеты' };

export default async function UniversityListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const universities = await getCollection<University>('universities', {
    locale: strapiLocale(locale),
    query: {
      fields: ['title', 'slug', 'shortContent', 'order'],
      populate: { image: true, city: { fields: ['title'] } },
    },
  });

  return (
    <div id="university">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              <div className="university-short-wrap" uk-filter="target: .js-filter">
                <CityFilter cities={uniqueCities(universities)} />
                <div className="uk-grid uk-child-width-1-1 uk-child-width-1-2@s js-filter" uk-grid="">
                  {universities.map((item) => (
                    <div key={item.id} data-city={item.city?.title}>
                      <Link
                        href={`/university/${item.slug}`}
                        className="blog-short-item uk-height-1-1 uk-flex-column"
                      >
                        <h2 className="head-short">{item.title}</h2>
                        <div className="blog-short-img uk-inline uk-cover-container uk-width-1-1">
                          <img
                            className="uk-cover"
                            src={mediaUrl(item.image, { width: 460, height: 300 }) ?? ''}
                            alt={item.title}
                            uk-cover=""
                          />
                          <div className="top-img-overlay uk-position-cover" />
                        </div>
                        <div className="blog-short-content">
                          <p>{item.shortContent}</p>
                        </div>
                        <div className="uk-flex-1 uk-visible@s" />
                      </Link>
                    </div>
                  ))}
                  <div data-city="all">
                    <div className="last-short-item">
                      <h2>Не можете определиться с университетом?</h2>
                      <p>
                        <a href="mailto:info@studycz.cz">Напишите нам</a> или{' '}
                        <Link href="/#call">закажите звонок</Link> и мы поможем Вам подобрать
                        подходящий университет.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
