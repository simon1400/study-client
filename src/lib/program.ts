import type { Program } from '@/types/strapi';

/**
 * `options` у программы — массив строк из Sanity: 'program-with-parametrs'
 * (блок с часами), 'payment-installments' (оплата частями), 'accent' (жёлтая кнопка).
 */
export type ProgramOption = 'program-with-parametrs' | 'payment-installments' | 'accent';

export function hasOption(program: Pick<Program, 'options'>, option: ProgramOption): boolean {
  return Array.isArray(program.options) && program.options.includes(option);
}
