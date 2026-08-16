import type { AccountUser } from '@/types/account';

/**
 * «Путь студента» из макета кабинета: четыре шага и прогресс по ним.
 * Считается из полей пользователя, чтобы дашборд, меню и страницы договора
 * с оплатой рассуждали о состоянии одинаково.
 */

export const QUESTIONNAIRE_STEPS = 6;

export type CabinetProgress = {
  /** Программа выбрана. */
  program: boolean;
  /** Сколько шагов анкеты заполнено (0…6) и заполнена ли она целиком. */
  questionnaireDone: number;
  questionnaire: boolean;
  contract: boolean;
  /** Человек отметил перевод, но менеджер ещё не подтвердил. */
  paymentPending: boolean;
  payment: boolean;
  /** Сколько из четырёх шагов закрыто. */
  done: number;
  total: number;
  /** Первый незакрытый шаг — на него ведёт активная кнопка дашборда. */
  next: 'program' | 'questionnaire' | 'contract' | 'payment' | null;
};

export function cabinetProgress(user: AccountUser): CabinetProgress {
  const program = Boolean(user.programmSelected);

  // stepQuestionare — следующий незаполненный шаг (1…6), но у полностью заполненной
  // анкеты он упирается в 6, поэтому «готово» определяет globalStep
  const questionnaire = user.globalStep >= 2;
  const questionnaireDone = questionnaire
    ? QUESTIONNAIRE_STEPS
    : Math.max(0, Math.min(QUESTIONNAIRE_STEPS, (user.stepQuestionare || 1) - 1));

  const contract = Boolean(user.contractSignedAt);
  const payment = user.paymentStatus === 'paid';
  const paymentPending = user.paymentStatus === 'pending';

  const flags = [program, questionnaire, contract, payment];
  const next = !program
    ? 'program'
    : !questionnaire
      ? 'questionnaire'
      : !contract
        ? 'contract'
        : !payment
          ? 'payment'
          : null;

  return {
    program,
    questionnaireDone,
    questionnaire,
    contract,
    paymentPending,
    payment,
    done: flags.filter(Boolean).length,
    total: flags.length,
    next,
  };
}

/** Дата в том же виде, что и в PDF договора: «16 августа 2026». */
export function formatDate(value: string | null | undefined, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const intlLocale = locale === 'cz' ? 'cs' : locale;
  return new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

/** Сумма прописью для кабинета: 4699 → «4 699 €». */
export function formatMoney(amount: number | null | undefined, currency: string | null): string | null {
  if (amount == null || !Number.isFinite(amount)) return null;
  return `${Math.round(amount).toLocaleString('ru-RU').replace(/ | /g, ' ')} ${currency || '€'}`;
}
