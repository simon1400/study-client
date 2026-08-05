/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { Partner } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import Html from '@/components/Html';
import '@/styles/legacy/partners.scss';

export const metadata: Metadata = { title: 'Партнеры' };

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const partners = await getCollection<Partner>('partners', {
    locale: strapiLocale(locale),
    query: { populate: { image: true } },
  });

  return (
    <div id="partners">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              <div
                className="uk-grid uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-1-3@m"
                uk-grid=""
                uk-height-match="target: > div > .partners-item > .partner-photo"
              >
                {partners.map((partner) => (
                  <div key={partner.id}>
                    <div className="partners-item content-wrap">
                      <div className="partner-photo uk-flex uk-flex-middle uk-flex-center uk-padding">
                        <img src={mediaUrl(partner.image) ?? ''} alt={partner.title} />
                      </div>
                      <div className="partners-content">
                        <h2>{partner.title}</h2>
                        {partner.url ? (
                          <a href={partner.url} target="_blank" rel="noreferrer noopener">
                            {partner.url.replace(/^https?:\/\//, '')}
                          </a>
                        ) : null}
                        <Html html={partner.content} />
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <div className="partners-item last-short-item">
                    <h2>Хотите стать нашим партнером?</h2>
                    <p>
                      <a href="mailto:info@studycz.cz">Напишите нам</a> или{' '}
                      <Link href="/#call">закажите звонок</Link> и мы обсудим детали нашего
                      партнерства.
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
