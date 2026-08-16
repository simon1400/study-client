'use client';

import country from '@/data/country.json';
import familyStatus from '@/data/familyStatus.json';
import { DateInput, SelectInput, SexInput, TextInput } from '../fields';
import { StepFooter, StepGrid } from '../StepChrome';
import { useStepForm } from '../useStepForm';
import type { Step1 } from '@/lib/questionnaire';

/** Личные данные (в базе — `step1`). */
export default function Step1Form({ initial, position }: { initial: Step1; position: number }) {
  const form = useStepForm<Step1>({ step: 1, position, initial });
  const { state, handleInput } = form;

  return (
    <>
      <StepGrid>
        <TextInput label="Имя" placeholder="Дмитрий" name="name" value={state.name} handle={handleInput} />
        <TextInput label="Фамилия" placeholder="Печунка" name="surname" value={state.surname} handle={handleInput} />
        <SexInput id="step_1" name="sex" value={state.sex} handle={handleInput} />
        <DateInput label="Дата рождения" name="dateBirth" value={state.dateBirth} handle={handleInput} />
        <SelectInput label="Семейное положение" name="status" data={familyStatus} value={state.status} handle={handleInput} />
        <SelectInput label="Страна рождения" name="country" data={country} value={state.country} handle={handleInput} />
        <TextInput label="Город рождения" placeholder="Киев" name="city" value={state.city} handle={handleInput} />
        <TextInput label="Гражданство при рождении" name="citizenshipBirth" value={state.citizenshipBirth} handle={handleInput} />
        <TextInput label="Гражданство сейчас" name="citizenship" value={state.citizenship} handle={handleInput} />
      </StepGrid>
      <StepFooter position={position} onSave={form.save} saving={form.saving} error={form.error} />
    </>
  );
}
