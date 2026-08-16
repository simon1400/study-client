'use client';

import { Fragment } from 'react';
import liveStatus from '@/data/liveStatus.json';
import { FormHead, FormHr, PeriodInput, SelectInput, TextInput } from '../fields';
import { ButtonControl, StepFooter, StepGrid } from '../StepChrome';
import { useStepForm } from '../useStepForm';
import { emptyEducation, type Education, type Step4 } from '@/lib/questionnaire';

/** Образование (в базе — `step4`): школа плюс произвольное число колледжей и вузов. */

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
      <TextInput label="Учебное заведение" full name="educationalInstitution" index={index} value={value.educationalInstitution} handle={handle} />
      <TextInput label="Адрес" name="adrress" index={index} value={value.adrress} handle={handle} />
      <TextInput label="Телефон учреждения" name="phone" index={index} value={value.phone} handle={handle} />
      <TextInput label="Индекс" name="code" index={index} value={value.code} handle={handle} />
      <PeriodInput label="Период обучения" name="period" index={index} value={value.period} handle={handle} />
    </>
  );
}

export default function Step4Form({ initial, position }: { initial: Step4; position: number }) {
  const form = useStepForm<Step4>({ step: 4, position, initial });
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

  return (
    <>
      <StepGrid>
        <SelectInput label="На данный момент я" full name="nowStatus" data={liveStatus} value={state.nowStatus} handle={handleInput} />

        <FormHead head="Среднее образование" />
        <TextInput label="Учебное заведение" full placeholder="Гимназия № 48, Киев" name="educationalInstitution" value={state.educationalInstitution} handle={handleInput} />
        <TextInput label="Адрес" name="adrress" value={state.adrress} handle={handleInput} />
        <TextInput label="Телефон учреждения" name="phone" value={state.phone} handle={handleInput} />
        <TextInput label="Индекс" name="code" value={state.code} handle={handleInput} />
        <PeriodInput label="Период обучения" name="period" value={state.period} handle={handleInput} />

        <FormHead head="Колледж / техникум" />
        {state.college.map((item, index) => (
          <Fragment key={`college-${index}`}>
            {index ? <FormHr /> : null}
            <EducationFields value={item} index={index} handle={handleEducation('college')} />
          </Fragment>
        ))}
        <ButtonControl
          count={state.college.length}
          addLabel="Колледж / техникум"
          onAdd={addEducation('college', 'countCollege')}
          onRemove={removeEducation('college', 'countCollege')}
        />

        <FormHead head="Высшее образование" />
        {state.university.map((item, index) => (
          <Fragment key={`university-${index}`}>
            {index ? <FormHr /> : null}
            <EducationFields value={item} index={index} handle={handleEducation('university')} />
          </Fragment>
        ))}
        <ButtonControl
          count={state.university.length}
          addLabel="Высшее образование"
          onAdd={addEducation('university', 'countUniversity')}
          onRemove={removeEducation('university', 'countUniversity')}
        />
      </StepGrid>
      <StepFooter position={position} onSave={form.save} saving={form.saving} error={form.error} />
    </>
  );
}
