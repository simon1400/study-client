/**
 * Договор личного кабинета — то, что отдаёт `GET /api/account/contract` в Strapi
 * (`study-strapi/src/utils/contract.ts`). Шаблон приходит уже с подставленными
 * программой, суммами и ФИО, чтобы страница, PDF и письмо совпадали до буквы.
 */

export type ContractView = {
  number: string;
  title: string;
  city: string | null;
  date: string;
  program: string | null;
  priceLabel: string | null;
  prepayPercent: number;
  prepayLabel: string | null;
  remainderLabel: string | null;
  amountDueLabel: string | null;
  sections: Array<{ title: string; body: string }>;
  executor: { name: string | null; address: string | null; email: string | null };
  customer: { name: string; number: string | null; email: string | null };
  footerNote: string | null;
  signature: string | null;
  signedAt: string | null;
};

export type BankDetails = {
  beneficiary: string | null;
  iban: string | null;
  swift: string | null;
  note: string | null;
};
