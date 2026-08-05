'use client';

import country from '@/data/country.json';
import { FormHead, SelectInput, TextInput } from '../fields';
import { StepDone, StepFooter } from '../StepChrome';
import Preload from '../Preload';
import { useStepForm } from '../useStepForm';
import type { Step5 } from '@/lib/questionnaire';

/** Шаг 5 — прописка, фактическое проживание и контакты. */
export default function Step5Form({ initial, stepQuestionare }: { initial: Step5; stepQuestionare: number }) {
  const form = useStepForm<Step5>({ step: 5, stepQuestionare, initial });
  const { state, handleInput } = form;

  if (form.done) return <StepDone onEdit={form.edit} />;

  return (
    <div className="content_panel">
      <div className="panel_item">
        <FormHead head="Место прописки" />
        <SelectInput
          label="Страна:"
          name="countryRegistration"
          data={country}
          value={state.countryRegistration}
          handle={handleInput}
        />
        <TextInput label="Город:" name="cityRegistration" value={state.cityRegistration} handle={handleInput} />
        <TextInput
          label="Улица, дом, квартира:"
          name="addressRegistration"
          value={state.addressRegistration}
          handle={handleInput}
        />
        <TextInput
          label="Почтовый индекс:"
          name="codeRegistration"
          value={state.codeRegistration}
          handle={handleInput}
        />

        <FormHead head="Место проживания" />
        <SelectInput
          label="Страна:"
          name="countryLiving"
          data={country}
          value={state.countryLiving}
          handle={handleInput}
        />
        <TextInput label="Город:" name="cityLiving" value={state.cityLiving} handle={handleInput} />
        <TextInput
          label="Улица, дом, квартира:"
          name="addressLiving"
          value={state.addressLiving}
          handle={handleInput}
        />
        <TextInput label="Почтовый индекс:" name="codeLiving" value={state.codeLiving} handle={handleInput} />

        <FormHead head="Контактная информация" />
        <TextInput label="Домашний телефон:" name="telContact" value={state.telContact} handle={handleInput} />
        <TextInput label="Мобильный телефон:" name="phoneContact" value={state.phoneContact} handle={handleInput} />
        <TextInput
          label="Телефон родителя:"
          name="phoneParentContact"
          value={state.phoneParentContact}
          handle={handleInput}
        />
        <TextInput label="E-mail:" name="emailContact" value={state.emailContact} handle={handleInput} />
        <TextInput label="Skype:" name="skypeContact" value={state.skypeContact} handle={handleInput} />

        <StepFooter onSave={form.save} saving={form.saving} error={form.error} />
        {form.saving ? <Preload /> : null}
      </div>
    </div>
  );
}
