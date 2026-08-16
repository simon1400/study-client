/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getSingle, mediaUrl } from '@/lib/strapi';
import { localeAlternates } from '@/lib/seo';
import type { ContactsPage } from '@/types/strapi';
import PageHero from '@/components/ui/PageHero';
import MapSection from '@/components/home/MapSection';

/** Телефон для tel: — без скобок, дефисов и пробелов, как на старом сайте. */
const telHref = (phone: string) => `tel:${phone.replace(/[-()_\s]+/g, '')}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.contacts' });
  return {
    title: t('title'),
    description: t('lead'),
    alternates: localeAlternates(locale, '/contacts'),
  };
}

export default async function ContactsPageRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [contacts, t] = await Promise.all([
    getSingle<ContactsPage>('contacts-page', {
      locale: strapiLocale(locale),
      query: { populate: { peoples: { populate: '*' } } },
    }),
    getTranslations({ locale }),
  ]);
  if (!contacts) return null;

  const rows = [
    contacts.address ? { key: 'address', icon: 'pin' as const, value: contacts.address, href: null } : null,
    contacts.phone
      ? { key: 'phone', icon: 'phone' as const, value: contacts.phone, href: telHref(contacts.phone) }
      : null,
    contacts.email
      ? { key: 'email', icon: 'mail' as const, value: contacts.email, href: `mailto:${contacts.email}` }
      : null,
    contacts.skype ? { key: 'skype', icon: 'chat' as const, value: contacts.skype, href: null } : null,
  ].filter(Boolean) as Array<{
    key: string;
    icon: 'pin' | 'phone' | 'mail' | 'chat';
    value: string;
    href: string | null;
  }>;

  return (
    <div id="contacts">
      <PageHero
        eyebrow={t('pages.contacts.eyebrow')}
        title={t('pages.contacts.title')}
        lead={t('pages.contacts.lead')}
      />

      <section className="section">
        <div className="container-page grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="flex flex-col justify-center gap-3.5 text-[15px]">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center gap-3.5">
                <span className="icon-box h-10 w-10">
                  <ContactIcon name={row.icon} />
                </span>
                {row.href ? (
                  <a href={row.href} className="text-blue hover:text-blue-dark">
                    {row.value}
                  </a>
                ) : (
                  <span>{row.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* у страницы контактов своя карта — офис, а не общий слой городов */}
          <MapSection mid="1Vb1NeI0TQaSpeRKgHRlSPPnB3ly1i5Zq" />
        </div>
      </section>

      {contacts.peoples?.length ? (
        <section className="section bg-mist !pt-0 md:!pt-0">
          <div className="container-page pt-11 md:pt-0">
            <h2 className="h2 mb-6 md:mb-8">{t('pages.contacts.team')}</h2>
            <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {contacts.peoples.map((person) => (
                <article
                  key={person.id}
                  className="rounded-card flex flex-col items-center gap-1.5 border border-line bg-white p-7 text-center md:p-8"
                >
                  {mediaUrl(person.image, { width: 200, height: 200 }) ? (
                    <img
                      src={mediaUrl(person.image, { width: 200, height: 200 })!}
                      alt={person.name}
                      width={200}
                      height={200}
                      className="mb-3 h-24 w-24 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="bg-tint text-blue mb-3 flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold">
                      {person.name.slice(0, 1)}
                    </span>
                  )}
                  <div className="text-ink text-[17px] font-semibold">{person.name}</div>
                  {person.position ? <div className="text-muted text-sm">{person.position}</div> : null}
                  {person.phone ? (
                    <a href={telHref(person.phone)} className="text-blue hover:text-blue-dark mt-2 text-sm">
                      {person.phone}
                    </a>
                  ) : null}
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className="text-blue hover:text-blue-dark text-sm">
                      {person.email}
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ContactIcon({ name }: { name: 'pin' | 'phone' | 'mail' | 'chat' }) {
  const paths = {
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </>
    ),
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  } as const;

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2434E8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
