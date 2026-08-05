'use client';

import month from '@/data/month.json';
import type { StepDate, StepPeriod } from '@/lib/questionnaire';
import '@/styles/legacy/user-checkbox.scss';

/**
 * Поля форм анкеты — перенос `routes/user/components/*` один в один.
 * Все они «управляемые снаружи»: значение и колбэк приходят из формы шага,
 * а `name`/`index` возвращаются обратно, чтобы форма знала, что менять
 * (в повторяемых блоках — братья, колледжи — index указывает на элемент массива).
 */

const MONTHS = month as Record<string, string>;

type Handle<T> = (value: T, name: string, index?: number) => void;

export function TextInput({
  label,
  placeholder = '',
  value,
  name = '',
  index = 0,
  handle,
}: {
  label: string;
  placeholder?: string;
  value: string;
  name?: string;
  index?: number;
  handle: Handle<string>;
}) {
  return (
    <div className="form_item">
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div>
          <label className="label_head">{label}</label>
        </div>
        <div>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handle(e.target.value, name, index)}
          />
        </div>
      </div>
    </div>
  );
}

export function SelectInput({
  label,
  value,
  data,
  name,
  handle,
}: {
  label: string;
  value: string;
  data: Record<string, string>;
  name: string;
  handle: Handle<string>;
}) {
  return (
    <div className="form_item">
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div>
          <label className="label_head">{label}</label>
        </div>
        <div className="uk-form-controls">
          <div uk-form-custom="target: > * > span:first-child">
            <select value={value} onChange={(e) => handle(e.target.value, name)}>
              <option value="">Выберите...</option>
              {Object.values(data).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button className="tm-select" type="button" tabIndex={-1}>
              <span>{value}</span>
              <span uk-icon="icon: chevron-down" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DateInput({
  label,
  value,
  name = '',
  index = 0,
  handle,
}: {
  label: string;
  value: StepDate;
  name?: string;
  index?: number;
  handle: Handle<StepDate>;
}) {
  return (
    <div className="form_item">
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div>
          <label className="label_head">{label}</label>
        </div>
        <div>
          <div className="tm-date-input uk-form-controls uk-grid uk-grid-collapse" uk-grid="">
            <div className="uk-width-1-4">
              <input
                className="uk-input"
                type="text"
                placeholder="04"
                value={value.day}
                onChange={(e) => handle({ ...value, day: e.target.value }, name, index)}
              />
            </div>
            <div className="uk-width-1-2" uk-form-custom="target: > * > span:first-child">
              <select
                value={value.month}
                onChange={(e) => handle({ ...value, month: e.target.value }, name, index)}
              >
                <option value="">Выберите...</option>
                {Object.keys(MONTHS).map((key) => (
                  <option key={key} value={Number(key) < 10 ? `0${key}` : key}>
                    {MONTHS[key]}
                  </option>
                ))}
              </select>
              <button className="tm-select" type="button" tabIndex={-1}>
                <span>{value.month}</span>
                <span uk-icon="icon: chevron-down" />
              </button>
            </div>
            <div className="uk-width-1-4">
              <input
                className="uk-input"
                type="text"
                placeholder="1996"
                value={value.year}
                onChange={(e) => handle({ ...value, year: e.target.value }, name, index)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SexInput({
  value,
  name,
  id,
  handle,
}: {
  value: string;
  name: string;
  id: string;
  handle: Handle<string>;
}) {
  return (
    <div className="form_item">
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div>
          <label className="label_head">Пол:</label>
        </div>
        <div>
          <div className="tm-radio uk-form-controls uk-grid uk-grid-collapse uk-child-width-1-2" uk-grid="">
            <div>
              <input
                className="uk-radio"
                type="radio"
                id={`${id}_1`}
                value="Мужской"
                checked={value === 'Мужской'}
                onChange={(e) => handle(e.target.value, name)}
                name={`sex_${id}`}
              />
              <label htmlFor={`${id}_1`}>Мужской</label>
            </div>
            <div>
              <input
                className="uk-radio"
                type="radio"
                id={`${id}_2`}
                value="Женский"
                checked={value === 'Женский'}
                onChange={(e) => handle(e.target.value, name)}
                name={`sex_${id}`}
              />
              <label htmlFor={`${id}_2`}>Женский</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckboxInput({
  label,
  value,
  name,
  handle,
}: {
  label: string;
  value: boolean;
  name: string;
  handle: Handle<boolean>;
}) {
  return (
    <div className="form_item_checkbox">
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div />
        <div>
          <label>
            <input
              className="uk-checkbox"
              name={name}
              type="checkbox"
              checked={value}
              onChange={() => handle(!value, name)}
            />
            {label}
          </label>
        </div>
      </div>
    </div>
  );
}

export function PeriodInput({
  label,
  value,
  name = '',
  index = 0,
  handle,
}: {
  label: string;
  value: StepPeriod;
  name?: string;
  index?: number;
  handle: Handle<StepPeriod>;
}) {
  return (
    <div className="form_item">
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div>
          <label className="label_head">{label}</label>
        </div>
        <div>
          <div className="form-period">
            <div className="uk-grid uk-child-width-1-2">
              <div>
                <input
                  type="text"
                  placeholder="2016"
                  value={value.od}
                  onChange={(e) => handle({ ...value, od: e.target.value }, name, index)}
                />
              </div>
              <div>
                <input
                  type="text"
                  className="period_input"
                  placeholder="2018"
                  value={value.do}
                  onChange={(e) => handle({ ...value, do: e.target.value }, name, index)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Подзаголовок внутри формы («Отец», «Братья», «Среднее образование»). */
export function FormHead({ head }: { head: string }) {
  return (
    <div className="form_item">
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div />
        <div>
          <h2 className="form_head">{head}</h2>
        </div>
      </div>
    </div>
  );
}

/** Разделитель между повторяющимися блоками. */
export function FormHr() {
  return (
    <div className="uk-grid uk-child-width-1-2">
      <div />
      <div>
        <hr className="uk-margin-top uk-margin-medium-bottom" style={{ maxWidth: '260px' }} />
      </div>
    </div>
  );
}
