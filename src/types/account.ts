/**
 * Пользователь личного кабинета — то, что отдаёт `GET /api/account/me` в Strapi.
 * Поля 1:1 с расширенной моделью users-permissions (см. study-strapi,
 * `src/extensions/users-permissions/content-types/user/schema.json`).
 *
 * Тип лежит отдельно от `lib/account.ts`, потому что его импортируют и клиентские
 * компоненты, а тот модуль тянет `next/headers` и в браузерный бандл не годится.
 */
export type AccountUser = {
  id: number;
  documentId: string;
  email: string;
  name: string | null;
  surname: string | null;
  birthday: string | null;
  sex: string | null;
  country: string | null;
  city: string | null;
  phone: string | null;
  /** Выбранная программа обучения; до выбора — «Не выбрано». */
  programm: string | null;
  programmSelected: boolean;
  dateCourse: string | null;
  price: string | null;
  /** Цена числом — из неё считается предоплата; null, если строку цены не разобрали. */
  priceAmount: number | null;
  priceCurrency: string | null;
  /** Шаг «пути студента» на главной ЛК: 0 — программа не выбрана, 2 — анкета заполнена. */
  globalStep: number;
  /** Следующий незаполненный шаг анкеты (1…6). */
  stepQuestionare: number;
  numberProfil: number | null;
  confirm: boolean;
  /** ФИО, которым подписан договор, и когда это произошло. */
  contractSignature: string | null;
  contractSignedAt: string | null;
  paymentPlan: 'half' | 'full' | null;
  /** none — не платил, pending — отметил перевод, paid — менеджер подтвердил поступление. */
  paymentStatus: 'none' | 'pending' | 'paid' | null;
  paymentMarkedAt: string | null;
  paymentConfirmedAt: string | null;
};
