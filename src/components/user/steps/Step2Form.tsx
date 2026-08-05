'use client';

import country from '@/data/country.json';
import { CheckboxInput, DateInput, SelectInput, TextInput } from '../fields';
import { StepDone, StepFooter } from '../StepChrome';
import Preload from '../Preload';
import { useStepForm } from '../useStepForm';
import type { Step2 } from '@/lib/questionnaire';
import '@/styles/sidebar-collapse.scss';

/** Шаг 2 — заграничный паспорт; блок про отказы раскрывается галочкой. */
export default function Step2Form({ initial, stepQuestionare }: { initial: Step2; stepQuestionare: number }) {
  const form = useStepForm<Step2>({ step: 2, stepQuestionare, initial });
  const { state, handleInput } = form;

  if (form.done) return <StepDone onEdit={form.edit} />;

  return (
    <div className="content_panel">
      <div className="panel_item">
        <TextInput label="Имя:" placeholder="Дмитрий" name="name" value={state.name} handle={handleInput} />
        <TextInput
          label="Фамилия:"
          placeholder="Печунка"
          name="surname"
          value={state.surname}
          handle={handleInput}
        />
        <TextInput label="Серия и номер паспорта:" name="passport" value={state.passport} handle={handleInput} />
        <SelectInput label="Страна выдачи:" name="country" data={country} value={state.country} handle={handleInput} />
        <TextInput label="Орган, выдавший документ:" name="authority" value={state.authority} handle={handleInput} />
        <DateInput label="Дата выдачи:" name="datePassport" value={state.datePassport} handle={handleInput} />
        <DateInput label="Действителен до:" name="valid" value={state.valid} handle={handleInput} />
        <CheckboxInput
          label="У меня были отказы в визе"
          name="waivers"
          value={state.waivers}
          handle={handleInput}
        />

        {/* раньше это раскрывал react-animate-height; смысл тот же — блок нужен только при отказах */}
        <div className={`sidebar-collapse ${state.waivers ? 'is-open' : ''}`}>
          <div>
            <TextInput label="Год отказа:" name="yearWaivers" value={state.yearWaivers} handle={handleInput} />
            <TextInput
              label="Отказавшая страна:"
              name="countryWaivers"
              value={state.countryWaivers}
              handle={handleInput}
            />
            <TextInput label="Тип визы:" name="typeVisa" value={state.typeVisa} handle={handleInput} />
            <TextInput label="Причина отказа:" name="reason" value={state.reason} handle={handleInput} />
          </div>
        </div>

        <StepFooter onSave={form.save} saving={form.saving} error={form.error} />
        {form.saving ? <Preload /> : null}
      </div>
    </div>
  );
}
