/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, mediaUrl } from '@/lib/strapi';
import type { Branch } from '@/types/strapi';
import Html from '@/components/Html';
import PageHero from '@/components/ui/PageHero';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.agents' });
  return { title: t('title'), description: t('lead') };
}

export default async function AgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [branches, t] = await Promise.all([
    getCollection<Branch>('branches', {
      locale: strapiLocale(locale),
      query: { populate: { flag: true, contactInformations: true } },
    }),
    getTranslations({ locale }),
  ]);

  return (
    <div id="agents">
      <PageHero
        eyebrow={t('pages.agents.eyebrow')}
        title={t('pages.agents.title')}
        lead={t('pages.agents.lead')}
      />

      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {branches.map((branch) => {
              const flag = mediaUrl(branch.flag, { width: 120, height: 120 });
              return (
                <article
                  key={branch.id}
                  className="rounded-card flex flex-col items-center gap-1.5 border border-line bg-white p-7 text-center md:p-8"
                >
                  {flag ? (
                    <span className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line">
                      <img src={flag} alt={branch.title} className="h-full w-full object-cover" loading="lazy" />
                    </span>
                  ) : null}

                  <h2 className="text-ink text-[17px] font-semibold">{branch.title}</h2>

                  {branch.contactInformations?.length ? (
                    <div className="mt-3 flex w-full flex-col gap-2.5 text-left">
                      {branch.contactInformations.map((contact) => (
                        <div key={contact.id} className="flex flex-col gap-0.5">
                          <span className="text-faint text-xs">{contact.type}</span>
                          <Html html={contact.value} className="prose-ds !text-sm [&_p]:m-0" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
