'use client';

import { useCallback, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { QUESTIONNAIRE_STEPS } from '@/lib/cabinet';
import type { StepNumber } from '@/lib/questionnaire';

/**
 * Общее поведение всех шести форм анкеты: локальное состояние, сохранение и
 * переход дальше.
 *
 * `step` — ключ хранения в Strapi (`stepN`), `position` — место шага в интерфейсе.
 * В редизайне они разошлись: макет ставит «Адрес и контакты» третьим, а в базе
 * это по-прежнему `step5`. Прогресс (`stepQuestionare`) считается по позиции —
 * иначе после третьего экрана он перепрыгивал бы в конец.
 *
 * Экрана «шаг заполнен» больше нет: форма всегда доступна для правки,
 * а закрытые шаги отмечены галочками в боковой навигации.
 */
export function useStepForm<T extends object>({
  step,
  position,
  initial,
}: {
  step: StepNumber;
  position: number;
  initial: T;
}) {
  const router = useRouter();
  const [state, setState] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

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
        body: JSON.stringify({ step, position, data: state }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      router.push(
        position === QUESTIONNAIRE_STEPS ? '/user' : `/user/questionnaire/step-${position + 1}`
      );
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return { state, setState, handleInput, save, saving, error, position };
}
