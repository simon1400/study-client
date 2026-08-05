/* eslint-disable @next/next/no-img-element -- статика из public/ */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getBySlug, getCollection } from '@/lib/strapi';
import { hasOption } from '@/lib/program';
import type { Program, TextItem } from '@/types/strapi';
import Sidebar from '@/components/Sidebar';
import Html from '@/components/Html';
import '@/styles/legacy/program-full.scss';

type Params = { locale: string; slug: string };

async function getProgram(locale: string, slug: string) {
  return getBySlug<Program>('programs', slug, {
    locale: strapiLocale(locale),
    query: {
      populate: {
        include: true,
        includeBefore: true,
        includeAfter: true,
        includeAdditional: true,
        notInclude: true,
      },
    },
  });
}

export async function generateStaticParams() {
  const programs = await getCollection<Program>('programs', {
    locale: 'ru',
    query: { fields: ['slug'] },
  });
  return programs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = await getProgram(locale, slug);
  return {
    title: program?.title ?? 'Программа',
    description: program?.shortContent ?? undefined,
  };
}

export default async function ProgramPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const program = await getProgram(locale, slug);
  if (!program) notFound();

  // вкладки «что входит в программу» — те же три группы, что были в Sanity
  const tabs: Array<{ id: string; label: string; items: TextItem[] }> = [
    { id: 'before', label: 'До приезда в Чехию', items: program.includeBefore ?? [] },
    { id: 'after', label: 'После приезда в Чехию', items: program.includeAfter ?? [] },
    { id: 'additional', label: 'Дополнительные услуги', items: program.includeAdditional ?? [] },
  ].filter((tab) => tab.items.length);

  return (
    <div id="program">
      <section className="archive-page">
        <div className="uk-container ">
          <div className="uk-grid" uk-grid="">
            <div className="uk-width-1-5@m">
              <Sidebar locale={locale} />
            </div>
            <div className="uk-width-4-5@m">
              <div className="full-program">
                <div className="full-program-head">
                  <h1>{program.title}</h1>
                </div>
                <div className="full-program-content">
                  <Html html={program.content} />
                </div>

                {hasOption(program, 'program-with-parametrs') ? (
                  <div className="program-item-hours full-program-hours">
                    <div className="uk-flex uk-flex-between uk-text-center uk-text-left@s">
                      {program.include.map((param) => (
                        <div key={param.id}>
                          <div className="hours-item">
                            <span>{param.title}</span>
                            <span>{param.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {tabs.length ? (
                  <>
                    <div className="full-program-image uk-cover-container uk-inline uk-width-1-1">
                      <img src="/program.jpg" alt={program.title} uk-cover="" />
                      <div className="uk-position-cover uk-flex uk-flex-center uk-flex-middle">
                        <h2>Что входит в программу?</h2>
                      </div>
                    </div>

                    <div className="program-timeline-wrap" uk-filter="target: .js-filter">
                      <ul className="uk-tab" uk-tab="">
                        {tabs.map((tab, index) => (
                          <li
                            key={tab.id}
                            className={index === 0 ? 'uk-active' : ''}
                            uk-filter-control={`[id='${tab.id}']`}
                          >
                            <a href="#">{tab.label}</a>
                          </li>
                        ))}
                      </ul>

                      <div className="program-timeline-content">
                        <div className="program-timeline-item">
                          <ul className="uk-margin-bottom js-filter">
                            {tabs.map((tab, index) => (
                              <li key={tab.id} id={tab.id} uk-switcher-item={String(index)}>
                                <ul className="ul-positive">
                                  {tab.items.map((item) => (
                                    <li key={item.id}>{item.text}</li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>

                          {program.notInclude.length ? (
                            <>
                              <div className="ul-head">
                                <img src="/ICON.png" alt="" />
                                Что не входит в программу?
                              </div>
                              <ul className="ul-negative">
                                {program.notInclude.map((item) => (
                                  <li key={item.id}>{item.text}</li>
                                ))}
                              </ul>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="short-footer program-full-footer">
                  <div className="uk-grid uk-child-width-1-1 uk-child-width-1-2@s" uk-grid="">
                    <div>
                      <div className="short-price">
                        <p>
                          Стоимость: <strong>{program.price}</strong>
                          {hasOption(program, 'payment-installments') ? (
                            <span>*возможна оплата частями</span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="uk-text-right@s">
                      <a href="#modal-registration" className="button button-accent" uk-toggle="">
                        Заполнить анкету
                      </a>
                    </div>
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
