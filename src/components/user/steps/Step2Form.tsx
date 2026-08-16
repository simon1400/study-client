'use client';

import country from '@/data/country.json';
import { CheckboxInput, DateInput, FormNote, SelectInput, TextInput } from '../fields';
import { StepFooter, StepGrid } from '../StepChrome';
import { useStepForm } from '../useStepForm';
import type { Step2 } from '@/lib/questionnaire';

/** Заграничный паспорт (в базе — `step2`); блок про отказы появляется по галочке. */
export default function Step2Form({ initial, position }: { initial: Step2; position: number }) {
  const form = useStepForm<Step2>({ step: 2, position, initial });
  const { state, handleInput } = form;

  return (
    <>
      <StepGrid>
        <TextInput label="Имя" placeholder="Дмитрий" name="name" value={state.name} handle={handleInput} />
        <TextInput label="Фамилия" placeholder="Печунка" name="surname" value={state.surname} handle={handleInput} />
        <TextInput label="Серия и номер паспорта" placeholder="FE 123456" name="passport" value={state.passport} handle={handleInput} />
        <SelectInput label="Страна выдачи" name="country" data={country} value={state.country} handle={handleInput} />
        <TextInput label="Орган, выдавший документ" name="authority" value={state.authority} handle={handleInput} />
        <DateInput label="Дата выдачи" name="datePassport" value={state.datePassport} handle={handleInput} />
        <DateInput label="Действителен до" name="valid" value={state.valid} handle={handleInput} />

        <CheckboxInput label="У меня были отказы в визе" name="waivers" value={state.waivers} handle={handleInput} />

        {state.waivers ? (
          <>
            <TextInput label="Год отказа" name="yearWaivers" value={state.yearWaivers} handle={handleInput} />
            <TextInput label="Отказавшая страна" name="countryWaivers" value={state.countryWaivers} handle={handleInput} />
            <TextInput label="Тип визы" name="typeVisa" value={state.typeVisa} handle={handleInput} />
            <TextInput label="Причина отказа" name="reason" value={state.reason} handle={handleInput} />
          </>
        ) : null}

        <FormNote>
          Проверьте срок действия паспорта: для студенческой визы он должен действовать с запасом. Если
          сомневаетесь — спросите менеджера.
        </FormNote>
      </StepGrid>
      <StepFooter position={position} onSave={form.save} saving={form.saving} error={form.error} />
    </>
  );
}
