/* eslint-disable @next/next/no-img-element -- логотипы идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, getSingle, mediaUrl } from '@/lib/strapi';
import type { Global, Partner } from '@/types/strapi';
import Html from '@/components/Html';
import PageHero from '@/components/ui/PageHero';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.partners' });
  return { title: t('title'), description: t('lead') };
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const strapi = strapiLocale(locale);
  const [partners, global, t] = await Promise.all([
    getCollection<Partner>('partners', { locale: strapi, query: { populate: { image: true } } }),
    getSingle<Global>('global', { locale: strapi, query: { populate: '*' } }),
    getTranslations({ locale }),
  ]);

  const email = global?.contacts?.email ?? 'info@studycz.cz';

  return (
    <div id="partners">
      <PageHero
        eyebrow={t('pages.partners.eyebrow')}
        title={t('pages.partners.title')}
        lead={t('pages.partners.lead')}
      />

      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => {
              const logo = mediaUrl(partner.image, { width: 480 });
              return (
                <article
                  key={partner.id}
                  className="rounded-card flex flex-col overflow-hidden border border-line"
                >
                  <div className="flex h-40 items-center justify-center border-b border-line bg-white p-6">
                    {logo ? (
                      <img
                        src={logo}
                        alt={partner.title}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-faint text-sm">{partner.title}</span>
                    )}
                  </div>

                  <div className="bg-mist flex flex-1 flex-col px-6 pt-5 pb-6">
                    <h2 className="text-ink m-0 text-[17px] leading-snug font-semibold">{partner.title}</h2>
                    {partner.url ? (
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue hover:text-blue-dark mt-1 text-[13px] font-semibold"
                      >
                        {partner.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    ) : null}
                    {partner.content ? (
                      <Html html={partner.content} className="prose-ds mt-3 !text-sm [&_p]:m-0" />
                    ) : null}
                  </div>
                </article>
              );
            })}

            <div className="rounded-card bg-tint flex flex-col justify-center p-7 md:px-7 md:py-[30px]">
              <div className="font-display text-ink mb-2.5 text-[19px] font-semibold">
                {t('pages.partners.partnerCta')}
              </div>
              <p className="text-body m-0 mb-5 text-sm">{t('pages.partners.partnerCtaText')}</p>
              <div className="flex flex-wrap gap-2.5">
                <a href={`mailto:${email}`} className="btn btn-secondary !px-5 !py-3 !text-sm">
                  {t('pages.partners.write')}
                </a>
                <Link href="/#call" className="btn btn-compact !px-5 !py-3">
                  {t('cta.call')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
