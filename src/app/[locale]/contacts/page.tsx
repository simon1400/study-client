/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getSingle, mediaUrl } from '@/lib/strapi';
import type { ContactsPage } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = { title: 'Контакты' };

/** Телефон для tel: — без скобок, дефисов и пробелов, как на старом сайте. */
const telHref = (phone: string) => `tel:${phone.replace(/[-()_\s]+/g, '')}`;

export default async function ContactsPageRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const contacts = await getSingle<ContactsPage>('contacts-page', {
    locale: strapiLocale(locale),
    query: { populate: { peoples: { populate: '*' } } },
  });
  if (!contacts) return null;

  return (
    <div id="contacts">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              <div className="contacts">
                <div className="uk-grid" uk-height-match="target: > div > div">
                  <div className="uk-width-1-1 uk-width-1-2@s uk-width-2-3@m uk-margin-medium-bottom">
                    <div className="contacts-map-wrap">
                      <div className="map uk-height-1-1">
                        <iframe
                          title="Mapa contact"
                          src="https://www.google.com/maps/d/u/0/embed?mid=1Vb1NeI0TQaSpeRKgHRlSPPnB3ly1i5Zq"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="uk-width-1-1 uk-width-1-2@s uk-width-1-3@m uk-margin-medium-bottom">
                    <div className="contacts-info-wrap">
                      <div className="contacts-info-item">
                        <span>Адрес:</span>
                        <p>{contacts.address}</p>
                      </div>
                      {contacts.phone ? (
                        <div className="contacts-info-item">
                          <span>Телефон:</span>
                          <p>
                            <a href={telHref(contacts.phone)}>{contacts.phone}</a>
                          </p>
                        </div>
                      ) : null}
                      {contacts.email ? (
                        <div className="contacts-info-item">
                          <span>Почта:</span>
                          <p>
                            <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                          </p>
                        </div>
                      ) : null}
                      {contacts.skype ? (
                        <div className="contacts-info-item">
                          <span>Skype:</span>
                          <p>{contacts.skype}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {contacts.peoples.map((person) => (
                    <div
                      key={person.id}
                      className="uk-width-1-1 uk-width-1-2@s uk-width-1-3@m uk-margin-medium-bottom"
                    >
                      <div className="contacts-people-item">
                        <div className="contacts-img-wrap uk-cover-container">
                          <img
                            className="uk-cover"
                            src={mediaUrl(person.image) ?? ''}
                            alt={person.name}
                            uk-cover=""
                          />
                        </div>
                        <h3>{person.name}</h3>
                        <p>{person.position}</p>
                        {person.phone ? (
                          <a className="contacts-phone" href={telHref(person.phone)}>
                            {person.phone}
                          </a>
                        ) : null}
                        {person.email ? (
                          <a className="contacts-email" href={`mailto:${person.email}`}>
                            {person.email}
                          </a>
                        ) : null}
                      </div>
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
