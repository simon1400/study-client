/* eslint-disable @next/next/no-img-element -- картинки идут из ImageKit с готовой трансформацией */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection, mediaUrl } from '@/lib/strapi';
import type { University } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import Html from '@/components/Html';
import Gallery from '@/components/Gallery';
import '@/styles/legacy/university-full.scss';

type Params = { locale: string; slug: string };

async function getUniversity(locale: string, slug: string) {
  return getBySlug<University>('universities', slug, {
    locale: strapiLocale(locale),
    query: {
      populate: {
        image: true,
        galery: true,
        facultyImage: true,
        faculties: { populate: '*' },
      },
    },
  });
}

export async function generateStaticParams() {
  const universities = await getCollection<University>('universities', {
    locale: 'ru',
    query: { fields: ['slug'] },
  });
  return universities.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const university = await getUniversity(locale, slug);
  return {
    title: university?.title ?? 'Университет',
    description: university?.shortContent ?? undefined,
  };
}

export default async function UniversityPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const university = await getUniversity(locale, slug);
  if (!university) notFound();

  return (
    <div id="university-full">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-1-1 uk-width-4-5@m">
              <div className="university-full content-wrap">
                <div className="top-img-with-gallary">
                  <div className="top-img uk-cover-container">
                    <img
                      src={mediaUrl(university.image, { width: 960, height: 300 }) ?? ''}
                      alt=""
                      uk-cover=""
                    />
                    <div className="top-img-overlay uk-position-cover" />
                  </div>
                  <div className="with-galery-content">
                    <h1>{university.title}</h1>
                    <Gallery images={university.galery} />
                  </div>
                </div>

                <div className="content">
                  <h2>Общая информация</h2>
                  <Html html={university.content} />
                </div>

                {university.faculties.length ? (
                  <div className="uni-info-wrap">
                    <div className="uni-info-top-img uk-cover-container uk-inline uk-width-1-1">
                      <img
                        src={mediaUrl(university.facultyImage, { width: 960, height: 200 }) ?? ''}
                        alt={university.facultyTitle ?? ''}
                        uk-cover=""
                      />
                      <h2 className="uk-position-cover uk-overlay uk-flex uk-flex-center uk-flex-middle uk-text-center">
                        {university.facultyTitle}
                      </h2>
                    </div>
                    <div className="uni-faculty-wrap">
                      <ul>
                        {university.faculties.map((faculty) => (
                          <li key={faculty.id}>
                            <span>{faculty.title}</span>
                            <ul>
                              {faculty.specializations.map((spec) => (
                                <li key={spec.id}>{spec.text}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="content-footer uk-text-right">
                      <a href="mailto:info@studycz.cz">Задать вопрос</a> или{' '}
                      <a href="#modal-registration" uk-toggle="" className="button button-accent">
                        Заполнить анкету
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
