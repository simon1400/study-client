/* eslint-disable @next/next/no-img-element -- вёрстка 1:1 со старым сайтом, статика из public/ */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getSingle } from '@/lib/strapi';
import type { Homepage } from '@/types/strapi';
import Html from '@/components/Html';
import CallForm from '@/components/home/CallForm';
import MapSection from '@/components/home/MapSection';
import '@/styles/legacy/homepage.scss';

// иконки услуг лежат в вёрстке, а не в CMS — порядок тот же, что и раньше
const SERVICE_ICONS = [
  '/ikony/nova-ikona-01.svg',
  '/ikony/nova-ikona-02.svg',
  '/ikony/nova-ikona-03.svg',
  '/ikony/nova-ikona-04.svg',
  '/ikony/nova-ikona-05.svg',
];

async function getHomepage(locale: string) {
  return getSingle<Homepage>('homepage', {
    locale: strapiLocale(locale),
    query: { populate: { homepageSteps: true, ourServices: { populate: '*' }, contactInfo: true } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const data = await getHomepage(locale);
  return {
    // на главной заголовок сайта не дублируем
    title: { absolute: data?.title ?? 'Study in the Czech Republic' },
    description: data?.description ?? undefined,
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getHomepage(locale);
  if (!data) return null;

  return (
    <div id="homepage">
      <section className="section-slide uk-cover-container uk-width-1-1">
        <img uk-cover="true" className="uk-width-1-1 uk-cover" src="/slide.jpg" alt={data.title} />
        <div className="uk-container">
          <div className="uk-grid uk-child-width-1-1" uk-grid="">
            <div>
              <div className="top-overlay">
                <h1>{data.title}</h1>
              </div>
            </div>
            <div>
              <p className="slide-description">{data.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-offers">
        <div className="uk-container  ">
          <div
            className="uk-grid uk-child-width-1-3@m uk-child-width-1-2@s uk-child-width-1-1"
            uk-height-match="target: > div > div > div"
            uk-grid=""
            uk-scrollspy="cls: uk-animation-fade; target: .offers-item; delay: 500"
          >
            <div>
              <div className="section-head-wrap">
                <h2
                  className="section-head section-head-blue section-head-contrast"
                  uk-scrollspy="cls:uk-animation-slide-right-small; offset-top: -250"
                >
                  ЧТО МЫ <br />
                  ПРЕДЛАГАЕМ?
                </h2>
                <p className="section-description">Наши услуги</p>
              </div>
            </div>
            {data.ourServices.map((item, index) => (
              <div key={item.id}>
                <div className="offers-item">
                  <div className="uk-panel">
                    <img
                      style={{ maxWidth: '30%' }}
                      className="uk-align-center uk-align-right uk-margin-remove-adjacent"
                      src={SERVICE_ICONS[index % SERVICE_ICONS.length]}
                      alt=""
                    />
                    <h3 className="head_3">{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                  {item.url ? (
                    <a href={item.url} className="button button-border">
                      Я хочу знать больше
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-steps cd-timeline js-cd-timeline">
        <div className="uk-container  ">
          <div className="uk-grid uk-child-width-1-1" uk-grid="true">
            <div>
              <div className="section-head-wrap">
                <h2
                  className="section-head section-head-yellow"
                  uk-scrollspy="cls:uk-animation-slide-right-small; offset-top: -250"
                >
                  КАК ВСЕ БУДЕТ <br />
                  ПРОИСХОДИТЬ?
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div
          className="cd-timeline__container"
          uk-scrollspy="cls: uk-animation-fade; target: .cd-timeline__block; delay: 500"
        >
          {data.homepageSteps.map((item, index) => (
            <div key={item.id} className="cd-timeline__block js-cd-block">
              <div className="cd-timeline__img cd-timeline__img--picture js-cd-img">{index + 1}</div>
              <div className="cd-timeline__content js-cd-content">
                <h2>{item.title}</h2>
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Секция «Наша медиатека» тянула ленту через устаревший Instagram API v1;
          он выключен, поэтому блока пока нет — вернём на Instagram Graph API отдельно. */}

      {data.contactInfo ? (
        <section className="section-contact" id="call">
          <div className="uk-container  ">
            <div className="uk-grid" uk-grid="true">
              <div className="uk-width-1-1 uk-text-center">
                <span className="head-span">{data.contactInfo.title}</span>
              </div>
              <div className="uk-width-1-2@s uk-width-1-1 uk-flex uk-flex-center">
                <CallForm />
              </div>
              <div className="uk-width-1-2@s uk-width-1-1">
                <div className="contact-content">
                  <Html html={data.contactInfo.content} />
                  <h4 className="head-contact">Примечание</h4>
                  <p>{data.contactInfo.append}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <MapSection />
    </div>
  );
}
