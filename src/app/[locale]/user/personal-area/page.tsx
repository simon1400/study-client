/* eslint-disable @next/next/no-img-element -- статика из public/, размеры задаёт SCSS */
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getSession } from '@/lib/account';
import { getCollection } from '@/lib/strapi';
import type { Program } from '@/types/strapi';
import SelectProgramModal, { type ProgramOption } from '@/components/user/SelectProgramModal';

export const metadata: Metadata = { title: 'Личный кабинет' };

/**
 * Главная личного кабинета: выбранная программа, путь студента и карточка
 * пользователя. Перенос `routes/user/personal_area`.
 */
export default async function PersonalAreaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSession();
  if (!user) redirect('/');

  const programs = await getCollection<Program>('programs', {
    locale: strapiLocale(locale),
    query: { fields: ['title', 'price', 'order'], populate: { period: true } },
  });

  const options: ProgramOption[] = programs.map((program) => ({
    title: program.title,
    price: program.price ?? '',
    // на старом сайте в карточку пользователя уезжала дата начала курса
    dateCourse: program.period?.from ?? '',
  }));

  const fullName = [user.name, user.surname].filter(Boolean).join(' ');

  return (
    <>
      <div className="content_panel">
        <div className="panel_item basic_info_panel">
          <a href="#modal-select-program" uk-toggle="" aria-label="Выбрать программу">
            <img src="/edit-regular.svg" alt="Edit" />
          </a>
          <div className="uk-grid uk-grid-small" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@l">
              <span>Программа:</span>
            </div>
            <div className="uk-width-1-1 uk-width-4-5@l">
              <p>{user.programm}</p>
            </div>
          </div>
          <div className="uk-grid uk-grid-small" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@l">
              <span>Дата курсов:</span>
            </div>
            <div className="uk-width-1-1 uk-width-4-5@l">
              <p>{user.dateCourse}</p>
            </div>
          </div>
          <div className="uk-grid uk-grid-small" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-5@l">
              <span>Стоимость:</span>
            </div>
            <div className="uk-width-1-1 uk-width-4-5@l">
              <p>{user.price}</p>
            </div>
          </div>
        </div>

        <div className="panel_item">
          <ul className="timeline_vertical">
            <li className={!user.globalStep ? 'active_timeline' : ''}>
              <h3>Выбор программы обучения</h3>
              <p>
                Привет, {user.name}! Первым делом{' '}
                <a href="#modal-select-program" uk-toggle="">
                  выберете программу
                </a>
                , которая будет отвечать Вашим требованиям и возможностям.
              </p>
            </li>
            <li className={user.globalStep === 1 ? 'active_timeline' : ''}>
              <h3>Заполнение анкеты</h3>
              <p>
                Теперь Вам необходимо внимательно{' '}
                <a href={`/user/questionnaire/step-${user.stepQuestionare}`}>заполнить анкету</a>, которая в
                последствии будет отправлена на рассмотрение в консульство.
              </p>
            </li>
            <li className={user.globalStep === 2 ? 'active_timeline' : ''}>
              <h3>Подписать договор</h3>
              <p>Мы отправим вам договор, который нужно изучить и при соглашении — подписать.</p>
            </li>
            <li className={user.globalStep === 3 ? 'active_timeline' : ''}>
              <h3>Предоплата курсов</h3>
              <p>
                После получения оплаты мы собираем Вам все необходимые документы для получения визы, записываем
                Вас на языковые курсы и бронируем место в общежитии.{' '}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="right_sidebar personal_sidebar">
        <div className="panel_item">
          <div className="uk-flex uk-flex-left uk-flex-middle">
            <div className="uk-visible@l">
              <div className="user_photo uk-cover-container">
                <img src={user.sex === 'Мужской' ? '/man.jpg' : '/girl.jpg'} alt="" uk-cover="" />
              </div>
            </div>
            <div>
              <div className="user_short_info">
                <h4>{fullName}</h4>
                <span>Номер анкеты: {user.numberProfil}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="info_block">
          <h3>Возникли трудности?</h3>
          <p>
            <a href="mailto:info@studycz.cz">Напишите нам</a> или{' '}
            <a href="#modal-call" uk-toggle="">
              закажите звонок
            </a>{' '}
            и мы проконсультируем по любому интересующему Вас вопросу в кратчайшие сроки.
          </p>
        </div>
      </div>

      <SelectProgramModal programs={options} selected={user.programmSelected ? user.programm : null} />
    </>
  );
}
