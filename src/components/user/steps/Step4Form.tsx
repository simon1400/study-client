'use client';

import liveStatus from '@/data/liveStatus.json';
import { FormHead, FormHr, PeriodInput, SelectInput, TextInput } from '../fields';
import { ButtonControl, StepDone, StepFooter } from '../StepChrome';
import Preload from '../Preload';
import { useStepForm } from '../useStepForm';
import { emptyEducation, type Education, type Step4 } from '@/lib/questionnaire';

/** Шаг 4 — образование: школа плюс произвольное число колледжей и вузов. */

type EducationKey = 'college' | 'university';

function EducationFields({
  value,
  index,
  handle,
}: {
  value: Education;
  index: number;
  handle: (value: unknown, name: string, index?: number) => void;
}) {
  return (
    <>
      <TextInput
        label="Образовательное учреждение:"
        name="educationalInstitution"
        index={index}
        value={value.educationalInstitution}
        handle={handle}
      />
      <TextInput label="Адрес:" name="adrress" index={index} value={value.adrress} handle={handle} />
      <TextInput label="Телефон учреждения:" name="phone" index={index} value={value.phone} handle={handle} />
      <TextInput label="Индекс:" name="code" index={index} value={value.code} handle={handle} />
      <PeriodInput label="Период обучения:" name="period" index={index} value={value.period} handle={handle} />
    </>
  );
}

export default function Step4Form({ initial, stepQuestionare }: { initial: Step4; stepQuestionare: number }) {
  const form = useStepForm<Step4>({ step: 4, stepQuestionare, initial });
  const { state, setState, handleInput } = form;

  const handleEducation = (key: EducationKey) => (value: unknown, name: string, index = 0) => {
    setState((current) => {
      const list = current[key].map((item, i) => (i === index ? { ...item, [name]: value } : item));
      return { ...current, [key]: list };
    });
  };

  const addEducation = (key: EducationKey, countKey: 'countCollege' | 'countUniversity') => () => {
    setState((current) => ({
      ...current,
      [key]: [...current[key], emptyEducation()],
      [countKey]: current[key].length + 1,
    }));
  };

  const removeEducation = (key: EducationKey, countKey: 'countCollege' | 'countUniversity') => () => {
    setState((current) => ({
      ...current,
      [key]: current[key].slice(0, -1),
      [countKey]: Math.max(0, current[key].length - 1),
    }));
  };

  if (form.done) return <StepDone onEdit={form.edit} />;

  return (
    <div className="content_panel">
      <div className="panel_item">
        <FormHead head="Текущая деятельность" />
        <SelectInput
          label="На данный момент я:"
          name="nowStatus"
          data={liveStatus}
          value={state.nowStatus}
          handle={handleInput}
        />

        <FormHead head="Среднее образование" />
        <TextInput
          label="Образовательное учреждение:"
          name="educationalInstitution"
          value={state.educationalInstitution}
          handle={handleInput}
        />
        <TextInput label="Адрес:" name="adrress" value={state.adrress} handle={handleInput} />
        <TextInput label="Телефон учреждения:" name="phone" value={state.phone} handle={handleInput} />
        <TextInput label="Индекс:" name="code" value={state.code} handle={handleInput} />
        <PeriodInput label="Период обучения:" name="period" value={state.period} handle={handleInput} />

        <FormHead head="Колледж" />
        {state.college.map((item, index) => (
          <div key={`college-${index}`}>
            {index ? <FormHr /> : null}
            <EducationFields value={item} index={index} handle={handleEducation('college')} />
          </div>
        ))}
        <ButtonControl
          count={state.college.length}
          onAdd={addEducation('college', 'countCollege')}
          onRemove={removeEducation('college', 'countCollege')}
        />

        <FormHead head="Высшее образование" />
        {state.university.map((item, index) => (
          <div key={`university-${index}`}>
            {index ? <FormHr /> : null}
            <EducationFields value={item} index={index} handle={handleEducation('university')} />
          </div>
        ))}
        <ButtonControl
          count={state.university.length}
          onAdd={addEducation('university', 'countUniversity')}
          onRemove={removeEducation('university', 'countUniversity')}
        />

        <StepFooter onSave={form.save} saving={form.saving} error={form.error} />
        {form.saving ? <Preload /> : null}
      </div>
    </div>
  );
}
