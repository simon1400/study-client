'use client';

import { DateInput, TextInput } from '../fields';
import { StepDone, StepFooter } from '../StepChrome';
import Preload from '../Preload';
import { useStepForm } from '../useStepForm';
import type { Step6 } from '@/lib/questionnaire';

/** Шаг 6 — приезд в Чехию. Последний: после сохранения возвращаемся в ЛК. */
export default function Step6Form({ initial, stepQuestionare }: { initial: Step6; stepQuestionare: number }) {
  const form = useStepForm<Step6>({ step: 6, stepQuestionare, initial });
  const { state, handleInput } = form;

  if (form.done) return <StepDone onEdit={form.edit} />;

  return (
    <div className="content_panel">
      <div className="panel_item">
        <DateInput label="Дата приезда:" name="dateEntry" value={state.dateEntry} handle={handleInput} />
        <TextInput label="Время приезда:" name="timeEntry" value={state.timeEntry} handle={handleInput} />
        <TextInput label="Город приезда:" name="cityEntry" value={state.cityEntry} handle={handleInput} />
        <TextInput label="Вид транспорта:" name="typeTransport" value={state.typeTransport} handle={handleInput} />
        <TextInput label="Номер рейса:" name="number" value={state.number} handle={handleInput} />
        <TextInput label="Название авиакомпании:" name="nameCompany" value={state.nameCompany} handle={handleInput} />

        <StepFooter onSave={form.save} saving={form.saving} error={form.error} />
        {form.saving ? <Preload /> : null}
      </div>
    </div>
  );
}
