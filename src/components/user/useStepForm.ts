'use client';

import { useCallback, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import type { StepNumber } from '@/lib/questionnaire';

/**
 * Общее поведение всех шести форм анкеты: локальное состояние, сохранение и
 * переход дальше.
 *
 * Куда двигать прогресс, решает Strapi — сюда приходит только «получилось/нет».
 * Старый `form_footer` считал это на клиенте по данным из localStorage и умел
 * откатить прогресс назад при правке уже заполненного шага.
 */
export function useStepForm<T extends object>({
  step,
  stepQuestionare,
  initial,
}: {
  step: StepNumber;
  /** Прогресс пользователя: если он больше номера шага, шаг уже заполнен. */
  stepQuestionare: number;
  initial: T;
}) {
  const router = useRouter();
  const [state, setState] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(stepQuestionare > step);

  /** Обработчик для полей: они возвращают значение и имя, индекс — для массивов. */
  const handleInput = useCallback((value: unknown, name: string) => {
    setState((current) => ({ ...current, [name]: value }));
  }, []);

  async function save() {
    setSaving(true);
    setError(false);
    try {
      const res = await fetch('/api/account/questionnaire', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data: state }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // шаг заполняется впервые — ведём дальше по анкете, как на старом сайте
      if (stepQuestionare <= step) {
        router.push(step === 6 ? '/user/personal-area' : `/user/questionnaire/step-${step + 1}`);
      } else {
        setDone(true);
      }
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return {
    state,
    setState,
    handleInput,
    save,
    saving,
    error,
    /** true — показываем экран «шаг заполнен» вместо формы. */
    done,
    edit: () => setDone(false),
  };
}
