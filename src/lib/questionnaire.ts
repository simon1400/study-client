/**
 * Анкета студента: 6 шагов, каждый — json-поле в Strapi (`questionnaire.step1…step6`).
 * Ключи 1:1 со старым сайтом (mongoose-модель `src/lambda/models/question.model.js`),
 * поэтому мигрированные анкеты открываются без конвертации.
 *
 * Модуль общий для сервера и клиента: только типы и дефолты, без обращений к сети.
 */

export type StepDate = { day: string; month: string; year: string };
export type StepPeriod = { od: string; do: string };

export const emptyDate = (): StepDate => ({ day: '', month: '', year: '' });
export const emptyPeriod = (): StepPeriod => ({ od: '', do: '' });

export type Step1 = {
  name: string;
  surname: string;
  sex: string;
  dateBirth: StepDate;
  status: string;
  country: string;
  city: string;
  citizenshipBirth: string;
  citizenship: string;
};

export type Step2 = {
  name: string;
  surname: string;
  passport: string;
  country: string;
  authority: string;
  datePassport: StepDate;
  valid: StepDate;
  waivers: boolean;
  yearWaivers: string;
  countryWaivers: string;
  typeVisa: string;
  reason: string;
};

/** Член семьи в блоках «Братья» / «Сёстры» (шаг 3). */
export type Relative = {
  name: string;
  surname: string;
  dateBirth: StepDate;
  citizenship: string;
  address: string;
  profession: string;
};

export type Step3 = {
  nameFather: string;
  surnameFather: string;
  dateBirthFather: StepDate;
  citizenshipFather: string;
  addressFather: string;
  professionFather: string;
  nameMother: string;
  surnameMother: string;
  dateBirthMother: StepDate;
  citizenshipMother: string;
  addressMother: string;
  professionMother: string;
  countBrother: number;
  countSister: number;
  brothers: Relative[];
  sisters: Relative[];
};

/** Учебное заведение в блоках «Колледж» / «Высшее образование» (шаг 4). */
export type Education = {
  educationalInstitution: string;
  adrress: string;
  phone: string;
  code: string;
  period: StepPeriod;
};

export type Step4 = Education & {
  nowStatus: string;
  countCollege: number;
  countUniversity: number;
  college: Education[];
  university: Education[];
};

export type Step5 = {
  countryRegistration: string;
  cityRegistration: string;
  addressRegistration: string;
  codeRegistration: string;
  countryLiving: string;
  cityLiving: string;
  addressLiving: string;
  codeLiving: string;
  telContact: string;
  phoneContact: string;
  phoneParentContact: string;
  emailContact: string;
  skypeContact: string;
};

export type Step6 = {
  dateEntry: StepDate;
  timeEntry: string;
  cityEntry: string;
  typeTransport: string;
  number: string;
  nameCompany: string;
};

export type Questionnaire = {
  documentId: string;
  step1: Partial<Step1> | null;
  step2: Partial<Step2> | null;
  step3: Partial<Step3> | null;
  step4: Partial<Step4> | null;
  step5: Partial<Step5> | null;
  step6: Partial<Step6> | null;
};

export const emptyRelative = (): Relative => ({
  name: '',
  surname: '',
  dateBirth: emptyDate(),
  citizenship: '',
  address: '',
  profession: '',
});

export const emptyEducation = (): Education => ({
  educationalInstitution: '',
  adrress: '',
  phone: '',
  code: '',
  period: emptyPeriod(),
});

const defaults = {
  1: (): Step1 => ({
    name: '',
    surname: '',
    sex: '',
    dateBirth: emptyDate(),
    status: '',
    country: '',
    city: '',
    citizenshipBirth: '',
    citizenship: '',
  }),
  2: (): Step2 => ({
    name: '',
    surname: '',
    passport: '',
    country: '',
    authority: '',
    datePassport: emptyDate(),
    valid: emptyDate(),
    waivers: false,
    yearWaivers: '',
    countryWaivers: '',
    typeVisa: '',
    reason: '',
  }),
  3: (): Step3 => ({
    nameFather: '',
    surnameFather: '',
    dateBirthFather: emptyDate(),
    citizenshipFather: '',
    addressFather: '',
    professionFather: '',
    nameMother: '',
    surnameMother: '',
    dateBirthMother: emptyDate(),
    citizenshipMother: '',
    addressMother: '',
    professionMother: '',
    countBrother: 0,
    countSister: 0,
    brothers: [],
    sisters: [],
  }),
  4: (): Step4 => ({
    nowStatus: '',
    ...emptyEducation(),
    countCollege: 0,
    countUniversity: 0,
    college: [],
    university: [],
  }),
  5: (): Step5 => ({
    countryRegistration: '',
    cityRegistration: '',
    addressRegistration: '',
    codeRegistration: '',
    countryLiving: '',
    cityLiving: '',
    addressLiving: '',
    codeLiving: '',
    telContact: '',
    phoneContact: '',
    phoneParentContact: '',
    emailContact: '',
    skypeContact: '',
  }),
  6: (): Step6 => ({
    dateEntry: emptyDate(),
    timeEntry: '',
    cityEntry: '',
    typeTransport: '',
    number: '',
    nameCompany: '',
  }),
} as const;

type StepMap = { 1: Step1; 2: Step2; 3: Step3; 4: Step4; 5: Step5; 6: Step6 };
export type StepNumber = keyof StepMap;

export const STEP_NUMBERS: StepNumber[] = [1, 2, 3, 4, 5, 6];

/** Заголовки правого сайдбара анкеты — те же, что в старом `right-sidebar`. */
export const STEP_TITLES: Record<StepNumber, string> = {
  1: 'Персональные данные',
  2: 'Заграничный паспорт',
  3: 'Информация о семье',
  4: 'Образование',
  5: 'Контакты',
  6: 'Приезд в Чехию',
};

export function isStepNumber(value: unknown): value is StepNumber {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6;
}

/**
 * Достраивает шаг до полной формы. Мигрированные анкеты приходят с дырами
 * (в Mongo пустые вложенные объекты просто отсутствовали) — старый код лечил
 * это проверками `if (dateBirth === undefined)` в каждом шаге, здесь одно место.
 */
export function withDefaults<N extends StepNumber>(step: N, value: unknown): StepMap[N] {
  const base = defaults[step]() as StepMap[N];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return base;

  const source = value as Record<string, unknown>;
  const out = { ...base } as Record<string, unknown>;

  for (const [key, fallback] of Object.entries(base)) {
    const incoming = source[key];
    if (incoming === undefined || incoming === null) continue;

    // вложенные объекты (dateBirth, period) достраиваем тем же способом
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) {
      out[key] = { ...(fallback as object), ...(incoming as object) };
    } else {
      out[key] = incoming;
    }
  }

  return out as StepMap[N];
}
