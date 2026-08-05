/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { Living } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import CityFilter, { uniqueCities } from '@/components/CityFilter';
import '@/styles/legacy/living-short.scss';

export const metadata: Metadata = { title: 'Проживание' };

export default async function LivingListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const livings = await getCollection<Living>('livings', {
    locale: strapiLocale(locale),
    query: {
      fields: ['title', 'slug', 'price', 'order'],
      populate: { image: true, galery: true, benefits: true, city: { fields: ['title'] } },
    },
  });

  return (
    <div id="living">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              <CityFilter cities={uniqueCities(livings)} />
              <div className="uk-grid uk-child-width-1-1 uk-child-width-1-2@s" uk-grid="">
                {livings.map((item) => {
                  const slides = [item.image, ...item.galery].filter(Boolean);
                  return (
                    <div key={item.id} data-city={item.city?.title}>
                      <div className="living-short-item short-item">
                        <div className="short-head">
                          <h2>{item.title}</h2>
                        </div>
                        <div
                          className="living-slider uk-position-relative uk-visible-toggle uk-light"
                          tabIndex={-1}
                          uk-slideshow="animation: scale"
                        >
                          <ul className="uk-slideshow-items">
                            {slides.map((image, index) => (
                              <li key={image?.id ?? index}>
                                <img src={mediaUrl(image, { width: 540 }) ?? ''} alt="" uk-cover="" />
                              </li>
                            ))}
                          </ul>
                          <div className="dotnav-custom uk-position-bottom uk-position-small">
                            <ul className="uk-dotnav">
                              {slides.map((image, index) => (
                                <li key={image?.id ?? index} uk-slideshow-item={String(index)}>
                                  <a href="#">Item {index + 1}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="living-content">
                          <ul className="ul-positive">
                            {item.benefits.map((benefit) => (
                              <li key={benefit.id}>{benefit.text}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="short-footer">
                          <div className="uk-grid uk-child-width-1-1 uk-child-width-1-2@m" uk-grid="">
                            <div>
                              <div className="short-price">
                                <p>
                                  Стоимость: <strong>{item.price}</strong>
                                  <span>*возможна оплата частями</span>
                                </p>
                              </div>
                            </div>
                            <div>
                              <Link href={`/living/${item.slug}`} className="button button-border">
                                Подробнее
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div>
                  <div className="last-short-item">
                    <h2>Не можете определиться с проживанием?</h2>
                    <p>
                      <a href="mailto:info@studycz.cz">Напишите нам</a> или{' '}
                      <Link href="/#call">закажите звонок</Link> и мы поможем Вам выбрать подходящее
                      жилье.
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
