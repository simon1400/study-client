'use client';

import country from '@/data/country.json';
import familyStatus from '@/data/familyStatus.json';
import { DateInput, SelectInput, SexInput, TextInput } from '../fields';
import { StepDone, StepFooter } from '../StepChrome';
import Preload from '../Preload';
import { useStepForm } from '../useStepForm';
import type { Step1 } from '@/lib/questionnaire';

/** Шаг 1 — персональные данные. */
export default function Step1Form({ initial, stepQuestionare }: { initial: Step1; stepQuestionare: number }) {
  const form = useStepForm<Step1>({ step: 1, stepQuestionare, initial });
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
        <SexInput id="step_1" name="sex" value={state.sex} handle={handleInput} />
        <DateInput label="Дата рождения:" name="dateBirth" value={state.dateBirth} handle={handleInput} />
        <SelectInput
          label="Семейное положение:"
          name="status"
          data={familyStatus}
          value={state.status}
          handle={handleInput}
        />
        <SelectInput
          label="Страна рождения:"
          name="country"
          data={country}
          value={state.country}
          handle={handleInput}
        />
        <TextInput label="Город рождения:" placeholder="Киев" name="city" value={state.city} handle={handleInput} />
        <TextInput
          label="Гражданство при рождении:"
          name="citizenshipBirth"
          value={state.citizenshipBirth}
          handle={handleInput}
        />
        <TextInput
          label="Современное гражданство:"
          name="citizenship"
          value={state.citizenship}
          handle={handleInput}
        />
        <StepFooter onSave={form.save} saving={form.saving} error={form.error} />
        {form.saving ? <Preload /> : null}
      </div>
    </div>
  );
}
