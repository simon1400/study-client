import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection } from '@/lib/strapi';
import type { Program } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import CityFilter, { uniqueCities } from '@/components/CityFilter';
import { hasOption } from '@/lib/program';

export const metadata: Metadata = { title: 'Программы' };

export default async function ProgramListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const programs = await getCollection<Program>('programs', {
    locale: strapiLocale(locale),
    query: {
      fields: ['title', 'slug', 'shortContent', 'price', 'order', 'options'],
      populate: { include: true, city: { fields: ['title'] } },
    },
  });

  return (
    <div id="programs">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-5@m uk-width-1-1">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-4-5@m uk-width-1-1" uk-filter="target: .js-filter">
              <CityFilter cities={uniqueCities(programs)} />
              <div
                className="uk-grid uk-child-width-1-2@s uk-child-width-1-1 js-filter"
                uk-grid=""
                uk-height-match="target: > div > .short-item > .short-content"
              >
                {programs.map((item) => (
                  <div key={item.id} data-city={item.city?.title}>
                    <div className="short-item">
                      <div className="short-head">
                        <h2>
                          Программа — <strong>«{item.title}»</strong>
                        </h2>
                      </div>
                      <div className="short-content">
                        <p>{item.shortContent}</p>
                      </div>
                      {hasOption(item, 'program-with-parametrs') ? (
                        <div className="program-item-hours uk-visible@s">
                          <div className="uk-grid uk-grid-small uk-child-width-1-3@s uk-child-width-1-1">
                            {item.include.map((param) => (
                              <div key={param.id}>
                                <div className="hours-item">
                                  <span>{param.title}</span>
                                  <span>{param.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="short-footer">
                        <div className="uk-grid uk-child-width-1-2@s uk-child-width-1-1" uk-grid="">
                          <div>
                            <div className="short-price">
                              <p>
                                Стоимость: <strong>{item.price}</strong>
                                {hasOption(item, 'payment-installments') ? (
                                  <span>*возможна оплата частями</span>
                                ) : null}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Link
                              href={`/program/${item.slug}`}
                              className={`button button-border ${hasOption(item, 'accent') ? 'button-yellow' : ''}`}
                            >
                              Подробнее
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div data-city="all">
                  <div className="last-short-item">
                    <h2>Не можете определиться с программой?</h2>
                    <p>
                      <a href="mailto:info@studycz.cz">Напишите нам</a> или{' '}
                      <Link href="/#call">закажите звонок</Link> и мы поможем Вам выбрать
                      подходящую программу.
                    </p>
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
