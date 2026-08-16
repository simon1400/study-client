'use client';

import { DateInput, FormNote, TextInput } from '../fields';
import { StepFooter, StepGrid } from '../StepChrome';
import { useStepForm } from '../useStepForm';
import type { Step6 } from '@/lib/questionnaire';

/** Приезд в Чехию (в базе — `step6`). Последний шаг: после сохранения — в обзор. */
export default function Step6Form({ initial, position }: { initial: Step6; position: number }) {
  const form = useStepForm<Step6>({ step: 6, position, initial });
  const { state, handleInput } = form;

  return (
    <>
      <StepGrid>
        <FormNote accent>
          Ещё нет билетов? Сохраните шаг пустым и заполните позже — анкета от этого не пострадает.
        </FormNote>

        <DateInput label="Дата приезда" name="dateEntry" value={state.dateEntry} handle={handleInput} />
        <TextInput label="Время приезда" placeholder="14:30" name="timeEntry" value={state.timeEntry} handle={handleInput} />
        <TextInput label="Город прибытия" placeholder="Прага" name="cityEntry" value={state.cityEntry} handle={handleInput} />
        <TextInput label="Вид транспорта" placeholder="Самолёт" name="typeTransport" value={state.typeTransport} handle={handleInput} />
        <TextInput label="Номер рейса" placeholder="PS 807" name="number" value={state.number} handle={handleInput} />
        <TextInput label="Авиакомпания / перевозчик" name="nameCompany" value={state.nameCompany} handle={handleInput} />
      </StepGrid>
      <StepFooter position={position} onSave={form.save} saving={form.saving} error={form.error} />
    </>
  );
}
