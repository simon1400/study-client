/* eslint-disable @next/next/no-img-element -- статика из public/ и ImageKit, next/image не используем (см. этап 4) */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getCollection, getSingle, mediaUrl } from '@/lib/strapi';
import type { Global, Homepage, MediaItem, Review } from '@/types/strapi';
import CallForm from '@/components/home/CallForm';
import MapSection from '@/components/home/MapSection';
import FormCtaButton from '@/components/FormCtaButton';

/** Иконки услуг лежат в вёрстке, а не в CMS — порядок тот же, что и раньше. */
const SERVICE_ICONS = [
  'nova-ikona-01',
  'nova-ikona-02',
  'nova-ikona-03',
  'nova-ikona-04',
  'nova-ikona-05',
];

const serviceIcon = (index: number, white: boolean) =>
  `/ikony/${SERVICE_ICONS[index % SERVICE_ICONS.length]}-${white ? 'white' : 'new'}.svg`;

async function getHomepage(locale: string) {
  return getSingle<Homepage>('homepage', {
    locale: strapiLocale(locale),
    // populate: '*' — а не пофамильный список: поля первого экрана (heroStats,
    // heroHighlights) появятся после пересборки Strapi, и явный populate по
    // несуществующему полю отдавал бы 400. Картинки внутри ourServices не нужны:
    // иконки программ лежат в public/ikony.
    query: { populate: '*' },
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

  const strapi = strapiLocale(locale);
  const [data, global, reviews, media, t] = await Promise.all([
    getHomepage(locale),
    getSingle<Global>('global', { locale: strapi, query: { populate: '*' } }),
    getCollection<Review>('reviews', { locale: strapi, query: { populate: '*' } }),
    getCollection<MediaItem>('media-items', { locale: strapi, query: { populate: '*' } }),
    getTranslations({ locale }),
  ]);

  if (!data) return null;

  const contacts = global?.contacts;
  const instagram = global?.socLinks?.instagram;

  return (
    <div id="homepage">
      {/* ------------------------------------------------------------ Hero */}
      <section className="bg-mist">
        <div className="container-page grid items-center gap-10 py-9 md:py-[72px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-[88px]">
          <div>
            {data.heroBadge ? <span className="badge badge-caps mb-5">{data.heroBadge}</span> : null}
            <h1 className="h1 mb-4 md:mb-[22px]">{data.title}</h1>
            {data.description ? <p className="lead mb-7 max-w-[480px] md:mb-[34px]">{data.description}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
              <Link href="/program" className="btn btn-primary btn-block sm:!inline-flex sm:!w-auto">
                {t('cta.pickProgram')}
              </Link>
              <a href="#call" className="btn btn-ghost btn-block sm:!inline-flex sm:!w-auto">
                {t('cta.call')}
              </a>
            </div>

            {data.heroStats?.length ? (
              <div className="mt-8 flex justify-between gap-4 rounded-2xl border border-line bg-white p-4 md:mt-10 md:justify-start md:gap-7 md:border-0 md:bg-transparent md:p-0">
                {data.heroStats.map((stat, i) => (
                  <div key={stat.id} className="contents">
                    {i > 0 ? <div className="bg-line-strong w-px" /> : null}
                    <div className="text-center md:text-left">
                      <div className="metric">{stat.value}</div>
                      <div className="text-muted text-xs md:text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="rounded-panel relative h-[220px] w-full overflow-hidden md:h-[460px]">
              <img
                src="/slide.jpg"
                alt={data.title}
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </div>
            <HeroHighlights items={data.heroHighlights ?? []} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Программы */}
      {data.ourServices?.length ? (
        <section id="programs" className="section bg-white">
          <div className="container-page">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-11 md:gap-8">
              <div>
                <div className="eyebrow">{t('home.programsEyebrow')}</div>
                <h2 className="h2">{t('home.programsTitle')}</h2>
              </div>
              <Link href="/program" className="link-more">
                {t('home.programsAll')} →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {data.ourServices.map((item, index) => {
                const featured = Boolean(item.featured);
                return (
                  <div key={item.id} className={`${featured ? 'card-accent' : 'card'} flex flex-col`}>
                    <div className={`icon-box icon-box-lg mb-5 ${featured ? 'icon-box-on-blue' : ''}`}>
                      <img src={serviceIcon(index, featured)} alt="" className="w-[30px]" />
                    </div>
                    <h3 className={`h3 mb-2.5 ${featured ? '!text-white' : ''}`}>{item.title}</h3>
                    <p className={`mb-5 flex-1 text-sm ${featured ? 'text-on-blue' : 'text-muted'}`}>{item.content}</p>
                    {item.price ? (
                      <>
                        <div className={`text-[13px] ${featured ? 'text-on-blue' : 'text-muted'}`}>
                          {t('common.price')}
                        </div>
                        <div className={`price mt-0.5 mb-4 ${featured ? '!text-yellow' : ''}`}>{item.price}</div>
                      </>
                    ) : null}
                    {item.url ? (
                      <a
                        href={item.url}
                        className={`btn btn-block ${featured ? 'btn-primary !text-sm' : 'btn-compact'}`}
                      >
                        {t('common.readMore')}
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ Шаги */}
      {data.homepageSteps?.length ? (
        <section id="steps" className="section bg-ink">
          <div className="container-page">
            <div className="mb-8 md:mb-12">
              <div className="eyebrow eyebrow-on-ink">{t('home.stepsEyebrow')}</div>
              <h2 className="h2 !text-white">{t('home.stepsTitle')}</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {data.homepageSteps.map((step, index) => (
                <div key={step.id} className="card-ink card-ink-hover relative overflow-hidden transition-colors">
                  <div
                    aria-hidden="true"
                    className="font-display pointer-events-none absolute -top-4 right-2.5 hidden text-[88px] leading-none font-bold text-white/6 md:block"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {/* на мобильных — кружок с номером, на десктопе — жёлтая черта (макеты) */}
                  <div className="bg-yellow text-ink mb-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold md:h-1 md:w-[34px] md:rounded-sm md:text-[0px]">
                    {index + 1}
                  </div>
                  <h3 className="h3 relative mb-2.5 !text-white md:!text-[17px]">{step.title}</h3>
                  <p className="text-on-ink relative m-0 text-sm">{step.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center md:mt-11">
              <FormCtaButton className="btn btn-primary btn-block md:!inline-flex md:!w-auto" />
            </div>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------------- Отзывы */}
      {reviews.length ? (
        <section id="reviews" className="section bg-mist">
          <div className="container-page">
            <div className="mb-8 md:mb-11">
              <div className="eyebrow">{t('home.reviewsEyebrow')}</div>
              <h2 className="h2">{t('home.reviewsTitle')}</h2>
            </div>

            <div className="flex snap-x gap-3.5 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 lg:grid-cols-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-card flex min-w-[280px] snap-start flex-col gap-4 border border-line bg-white p-6 md:min-w-0 md:gap-[18px] md:p-7"
                >
                  <div className="text-yellow tracking-[3px]" aria-label={`${review.rating ?? 5}/5`}>
                    {'★'.repeat(review.rating ?? 5)}
                  </div>
                  <p className="text-body m-0 flex-1 text-sm md:text-[15px]">{review.text}</p>
                  <div className="flex items-center gap-3.5">
                    {mediaUrl(review.photo, { width: 96, height: 96 }) ? (
                      <img
                        src={mediaUrl(review.photo, { width: 96, height: 96 })!}
                        alt={review.name}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="bg-tint text-blue flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold">
                        {review.name.slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <div className="text-ink text-[15px] font-semibold">{review.name}</div>
                      {review.role ? <div className="text-muted text-[13px]">{review.role}</div> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------- Медиатека */}
      {media.length ? (
        <section id="media" className="section bg-white !pb-0">
          <div className="container-page">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-11 md:gap-8">
              <div>
                <div className="eyebrow">{t('home.mediaEyebrow')}</div>
                <h2 className="h2">{t('home.mediaTitle')}</h2>
              </div>
              {instagram ? (
                <a href={instagram} target="_blank" rel="noreferrer noopener" className="link-more">
                  <img src="/instagram-brands.svg" alt="" className="h-[18px] w-auto" />
                  {t('home.mediaLink')} →
                </a>
              ) : null}
            </div>

            <div className="grid auto-rows-[140px] grid-cols-2 gap-3.5 md:auto-rows-[200px] md:grid-cols-4">
              {media.map((item) => {
                const src = mediaUrl(item.image, { width: 600 });
                if (!src) return null;
                const tile = (
                  <>
                    <img
                      src={src}
                      alt={item.caption ?? ''}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {item.kind === 'video' ? (
                      <span className="bg-ink/75 pointer-events-none absolute bottom-3.5 left-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-full">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    ) : null}
                  </>
                );
                const cls = `rounded-card relative overflow-hidden ${item.tall ? 'row-span-2' : ''}`;
                return item.url ? (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer noopener" className={cls}>
                    {tile}
                  </a>
                ) : (
                  <div key={item.id} className={cls}>
                    {tile}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------- Заказать звонок */}
      {data.contactInfo ? (
        <section id="call" className="section bg-white">
          <div className="container-page">
            <div className="rounded-hero from-blue to-blue-dark grid items-center gap-8 bg-linear-[120deg] p-7 md:grid-cols-2 md:gap-14 md:p-[56px_60px]">
              <div>
                <h2 className="h2 !text-white">{data.contactInfo.title}</h2>
                <div className="text-on-blue prose-ds mt-4 !text-base [&_*]:!text-inherit">
                  <p className="m-0">{data.contactInfo.content}</p>
                </div>
                {data.contactInfo.append ? (
                  <p className="text-on-ink-faint mt-3 text-sm">{data.contactInfo.append}</p>
                ) : null}
                {contacts?.email ? (
                  <a
                    href={`mailto:${contacts.email}`}
                    className="text-yellow hover:text-yellow-dark mt-3 inline-block text-sm font-semibold"
                  >
                    {contacts.email}
                  </a>
                ) : null}
              </div>
              <CallForm />
            </div>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------------- Контакты */}
      <section id="contacts" className="section bg-mist">
        <div className="container-page grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="flex flex-col justify-center gap-5 md:gap-[22px]">
            <h2 className="h2">{t('home.contactsTitle')}</h2>

            <div className="flex flex-col gap-3.5 text-[15px]">
              <ContactRow icon="pin">Brno, Czechia</ContactRow>
              {contacts?.phone ? (
                <ContactRow icon="phone">
                  <a href={`tel:${contacts.phone.replace(/[^+\d]/g, '')}`} className="text-blue hover:text-blue-dark">
                    {contacts.phone}
                  </a>
                </ContactRow>
              ) : null}
              {contacts?.email ? (
                <ContactRow icon="mail">
                  <a href={`mailto:${contacts.email}`} className="text-blue hover:text-blue-dark">
                    {contacts.email}
                  </a>
                </ContactRow>
              ) : null}
            </div>

            <SocialRow links={global?.socLinks ?? null} />
          </div>

          <MapSection />
        </div>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------- частности */

/** Плашки поверх фото первого экрана. Позиции — по макету, стиль берётся из CMS. */
function HeroHighlights({ items }: { items: Homepage['heroHighlights'] }) {
  if (!items?.length) return null;

  const positions = [
    'md:-left-7 md:bottom-[132px]',
    'md:-right-4 md:top-7',
    'md:right-6 md:-bottom-5',
  ];

  return (
    <div className="mt-3 flex flex-col gap-3 md:mt-0 md:block">
      {items.slice(0, 3).map((item, index) => {
        const dark = item.style === 'ink';
        return (
          <div
            key={item.id}
            className={`rounded-2xl p-3.5 md:absolute md:px-[18px] md:py-3.5 ${positions[index] ?? ''} ${
              dark ? 'bg-ink shadow-float-dark text-white' : 'shadow-float bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {!dark ? (
                <span className={`icon-box ${item.style === 'yellow' ? 'icon-box-yellow' : ''}`}>
                  <img
                    src={serviceIcon(item.style === 'yellow' ? 2 : 0, false)}
                    alt=""
                    className="w-[26px]"
                  />
                </span>
              ) : null}
              <div>
                <div className={`text-[15px] font-semibold ${dark ? 'text-yellow font-display' : 'text-ink'}`}>
                  {item.title}
                </div>
                {item.text ? (
                  <div className={`text-[13px] ${dark ? 'text-on-blue' : 'text-muted'}`}>{item.text}</div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactRow({ icon, children }: { icon: 'pin' | 'phone' | 'mail'; children: React.ReactNode }) {
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
  } as const;

  return (
    <div className="flex items-center gap-3.5">
      <span className="icon-box h-10 w-10">
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
          {paths[icon]}
        </svg>
      </span>
      <span>{children}</span>
    </div>
  );
}

function SocialRow({ links }: { links: Global['socLinks'] }) {
  const soc = [
    { key: 'facebook', icon: '/facebook-f-brands.svg', label: 'Facebook' },
    { key: 'vkontakte', icon: '/vk-brands.svg', label: 'VK' },
    { key: 'instagram', icon: '/instagram-brands.svg', label: 'Instagram' },
  ] as const;

  const visible = soc.filter(({ key }) => links?.[key]);
  if (!visible.length) return null;

  return (
    <div className="flex gap-3">
      {visible.map(({ key, icon, label }) => (
        <a
          key={key}
          href={links![key]!}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          className="hover:border-blue flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line bg-white transition-colors"
        >
          <img src={icon} alt="" className="h-[18px] w-auto" />
        </a>
      ))}
    </div>
  );
}
