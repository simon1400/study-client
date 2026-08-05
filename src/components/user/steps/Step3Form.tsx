'use client';

import { DateInput, FormHead, FormHr, TextInput } from '../fields';
import { ButtonControl, StepDone, StepFooter } from '../StepChrome';
import Preload from '../Preload';
import { useStepForm } from '../useStepForm';
import { emptyRelative, type Relative, type Step3 } from '@/lib/questionnaire';

/** Шаг 3 — семья: родители плюс произвольное число братьев и сестёр. */

type RelativeKey = 'brothers' | 'sisters';

/** Родитель: поля лежат в состоянии плоско, с суффиксом Father/Mother. */
function ParentFields({
  suffix,
  state,
  handle,
}: {
  suffix: 'Father' | 'Mother';
  state: Step3;
  handle: (value: unknown, name: string) => void;
}) {
  return (
    <>
      <TextInput
        label="Имя:"
        placeholder="Дмитрий"
        name={`name${suffix}`}
        value={state[`name${suffix}`]}
        handle={handle}
      />
      <TextInput
        label="Фамилия:"
        placeholder="Печунка"
        name={`surname${suffix}`}
        value={state[`surname${suffix}`]}
        handle={handle}
      />
      <DateInput
        label="Дата рождения:"
        name={`dateBirth${suffix}`}
        value={state[`dateBirth${suffix}`]}
        handle={handle}
      />
      <TextInput label="Гражданство:" name={`citizenship${suffix}`} value={state[`citizenship${suffix}`]} handle={handle} />
      <TextInput label="Адрес прописки:" name={`address${suffix}`} value={state[`address${suffix}`]} handle={handle} />
      <TextInput label="Профессия:" name={`profession${suffix}`} value={state[`profession${suffix}`]} handle={handle} />
    </>
  );
}

/** Брат или сестра: те же поля, но внутри массива — правим по индексу. */
function RelativeFields({
  value,
  index,
  handle,
}: {
  value: Relative;
  index: number;
  handle: (value: unknown, name: string, index?: number) => void;
}) {
  return (
    <>
      <TextInput label="Имя:" placeholder="Дмитрий" name="name" index={index} value={value.name} handle={handle} />
      <TextInput
        label="Фамилия:"
        placeholder="Печунка"
        name="surname"
        index={index}
        value={value.surname}
        handle={handle}
      />
      <DateInput label="Дата рождения:" name="dateBirth" index={index} value={value.dateBirth} handle={handle} />
      <TextInput label="Гражданство:" name="citizenship" index={index} value={value.citizenship} handle={handle} />
      <TextInput label="Адрес прописки:" name="address" index={index} value={value.address} handle={handle} />
      <TextInput label="Профессия:" name="profession" index={index} value={value.profession} handle={handle} />
    </>
  );
}

export default function Step3Form({ initial, stepQuestionare }: { initial: Step3; stepQuestionare: number }) {
  const form = useStepForm<Step3>({ step: 3, stepQuestionare, initial });
  const { state, setState, handleInput } = form;

  /** Правка одного поля у брата/сестры под индексом. */
  const handleRelative = (key: RelativeKey) => (value: unknown, name: string, index = 0) => {
    setState((current) => {
      const list = current[key].map((item, i) => (i === index ? { ...item, [name]: value } : item));
      return { ...current, [key]: list };
    });
  };

  const addRelative = (key: RelativeKey, countKey: 'countBrother' | 'countSister') => () => {
    setState((current) => ({
      ...current,
      [key]: [...current[key], emptyRelative()],
      [countKey]: current[key].length + 1,
    }));
  };

  const removeRelative = (key: RelativeKey, countKey: 'countBrother' | 'countSister') => () => {
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
        <FormHead head="Отец" />
        <ParentFields suffix="Father" state={state} handle={handleInput} />

        <FormHead head="Мать" />
        <ParentFields suffix="Mother" state={state} handle={handleInput} />

        <FormHead head="Братья" />
        {state.brothers.map((item, index) => (
          <div key={`brother-${index}`}>
            {index ? <FormHr /> : null}
            <RelativeFields value={item} index={index} handle={handleRelative('brothers')} />
          </div>
        ))}
        <ButtonControl
          count={state.brothers.length}
          onAdd={addRelative('brothers', 'countBrother')}
          onRemove={removeRelative('brothers', 'countBrother')}
        />

        <FormHead head="Сестры" />
        {state.sisters.map((item, index) => (
          <div key={`sister-${index}`}>
            {index ? <FormHr /> : null}
            <RelativeFields value={item} index={index} handle={handleRelative('sisters')} />
          </div>
        ))}
        <ButtonControl
          count={state.sisters.length}
          onAdd={addRelative('sisters', 'countSister')}
          onRemove={removeRelative('sisters', 'countSister')}
        />

        <StepFooter onSave={form.save} saving={form.saving} error={form.error} />
        {form.saving ? <Preload /> : null}
      </div>
    </div>
  );
}
