'use client';

import country from '@/data/country.json';
import { FormHead, SelectInput, TextInput } from '../fields';
import { StepFooter, StepGrid } from '../StepChrome';
import { useStepForm } from '../useStepForm';
import type { Step5 } from '@/lib/questionnaire';

/**
 * Адрес и контакты (в базе — `step5`). В макете редизайна это третий экран,
 * поэтому позиция приходит снаружи, а ключ хранения остался прежним.
 */
export default function Step5Form({ initial, position }: { initial: Step5; position: number }) {
  const form = useStepForm<Step5>({ step: 5, position, initial });
  const { state, handleInput } = form;

  return (
    <>
      <StepGrid>
        <FormHead head="Место прописки" />
        <SelectInput label="Страна" name="countryRegistration" data={country} value={state.countryRegistration} handle={handleInput} />
        <TextInput label="Город" placeholder="Киев" name="cityRegistration" value={state.cityRegistration} handle={handleInput} />
        <TextInput label="Улица, дом, квартира" placeholder="ул. Крещатик, 12, кв. 5" name="addressRegistration" value={state.addressRegistration} handle={handleInput} />
        <TextInput label="Почтовый индекс" placeholder="01001" name="codeRegistration" value={state.codeRegistration} handle={handleInput} />

        <FormHead head="Место проживания" />
        <SelectInput label="Страна" name="countryLiving" data={country} value={state.countryLiving} handle={handleInput} />
        <TextInput label="Город" name="cityLiving" value={state.cityLiving} handle={handleInput} />
        <TextInput label="Улица, дом, квартира" name="addressLiving" value={state.addressLiving} handle={handleInput} />
        <TextInput label="Почтовый индекс" name="codeLiving" value={state.codeLiving} handle={handleInput} />

        <FormHead head="Контакты" />
        <TextInput label="Мобильный телефон" placeholder="+380 63 000 00 00" name="phoneContact" value={state.phoneContact} handle={handleInput} />
        <TextInput label="Телефон родителя" placeholder="+380 67 000 00 00" name="phoneParentContact" value={state.phoneParentContact} handle={handleInput} />
        <TextInput label="Домашний телефон" name="telContact" value={state.telContact} handle={handleInput} />
        <TextInput label="E-mail" placeholder="example@email.com" name="emailContact" value={state.emailContact} handle={handleInput} />
        <TextInput label="Skype" name="skypeContact" value={state.skypeContact} handle={handleInput} />
      </StepGrid>
      <StepFooter position={position} onSave={form.save} saving={form.saving} error={form.error} />
    </>
  );
}
