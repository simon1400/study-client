/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { Branch } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import Html from '@/components/Html';

export const metadata: Metadata = { title: 'Представители' };

export default async function AgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const branches = await getCollection<Branch>('branches', {
    locale: strapiLocale(locale),
    query: { populate: { flag: true, contactInformations: true } },
  });

  return (
    <div id="agents">
      <section className="archive-page">
        <div className="uk-container">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              {branches.map((branch) => (
                <div key={branch.id} className="agent_item content-wrap uk-margin-medium-bottom">
                  <div className="agent-top short-item uk-position-relative">
                    <div className="short-head">
                      <h2>
                        Представитель в <strong>{branch.title}</strong>
                      </h2>
                    </div>
                    <img
                      className="uk-position-absolute"
                      src={mediaUrl(branch.flag, { width: 30, height: 20 }) ?? ''}
                      alt={branch.title}
                    />
                  </div>
                  <div className="agent-content">
                    {branch.contactInformations.map((contact) => (
                      <div key={contact.id} className="uk-grid uk-grid-small contacts-info-item">
                        <div className="uk-width-1-1 uk-width-1-6@s uk-text-right@s">
                          <span>{contact.type}:</span>
                        </div>
                        <div className="uk-width-1-1 uk-width-5-6@s">
                          <Html html={contact.value} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
