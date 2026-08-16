'use client';

import month from '@/data/month.json';
import type { StepDate, StepPeriod } from '@/lib/questionnaire';

/**
 * Поля форм анкеты в стиле редизайна (макет «Кабинет → Анкета»): лейбл сверху,
 * поле 48px с радиусом 12px, сетка в две колонки.
 *
 * Пропсы намеренно оставлены прежними (`value` / `name` / `index` / `handle`),
 * поэтому формы шагов не переписывались под новую вёрстку — сменились только
 * сами поля. Всё, что шире одной колонки, помечается `full`.
 */

const MONTHS = month as Record<string, string>;

type Handle<T> = (value: T, name: string, index?: number) => void;

/** Обёртка поля: лейбл + контрол; `full` растягивает на обе колонки. */
function Cell({
  label,
  full,
  htmlFor,
  children,
}: {
  label?: string;
  full?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`grid content-start gap-1.5 ${full ? 'md:col-span-2' : ''}`}>
      {label ? (
        <label className="text-muted text-[13px] font-semibold" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}

export function TextInput({
  label,
  placeholder = '',
  value,
  name = '',
  index = 0,
  full,
  handle,
}: {
  label: string;
  placeholder?: string;
  value: string;
  name?: string;
  index?: number;
  full?: boolean;
  handle: Handle<string>;
}) {
  return (
    <Cell label={label} full={full}>
      <input
        type="text"
        className="field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handle(e.target.value, name, index)}
      />
    </Cell>
  );
}

export function SelectInput({
  label,
  value,
  data,
  name,
  full,
  handle,
}: {
  label: string;
  value: string;
  data: Record<string, string>;
  name: string;
  full?: boolean;
  handle: Handle<string>;
}) {
  return (
    <Cell label={label} full={full}>
      <select className="field" value={value} onChange={(e) => handle(e.target.value, name)}>
        <option value="">—</option>
        {Object.values(data).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </Cell>
  );
}

/**
 * Дата тремя контролами (день / месяц / год) — так она и лежит в анкете
 * (`{day, month, year}`), менять формат нельзя: мигрированные анкеты сломаются.
 */
export function DateInput({
  label,
  value,
  name = '',
  index = 0,
  full,
  handle,
}: {
  label: string;
  value: StepDate;
  name?: string;
  index?: number;
  full?: boolean;
  handle: Handle<StepDate>;
}) {
  return (
    <Cell label={label} full={full}>
      <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-2">
        <input
          type="text"
          className="field !px-3"
          placeholder="04"
          inputMode="numeric"
          value={value.day}
          onChange={(e) => handle({ ...value, day: e.target.value }, name, index)}
        />
        <select
          className="field !px-2"
          value={value.month}
          onChange={(e) => handle({ ...value, month: e.target.value }, name, index)}
        >
          <option value="">—</option>
          {Object.keys(MONTHS).map((key) => (
            <option key={key} value={Number(key) < 10 ? `0${key}` : key}>
              {MONTHS[key]}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="field !px-3"
          placeholder="2007"
          inputMode="numeric"
          value={value.year}
          onChange={(e) => handle({ ...value, year: e.target.value }, name, index)}
        />
      </div>
    </Cell>
  );
}

/** Пол — сегментированный переключатель из макета. */
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
  const options = ['Мужской', 'Женский'];

  return (
    <Cell label="Пол">
      <div className="flex h-12 overflow-hidden rounded-xl border border-border">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            id={`${id}_${option}`}
            aria-pressed={value === option}
            onClick={() => handle(option, name)}
            className={`flex-1 cursor-pointer border-0 text-sm font-semibold transition-colors ${
              value === option ? 'bg-blue text-white' : 'text-muted bg-white hover:text-ink'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </Cell>
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
    <div className="text-body flex items-center md:col-span-2">
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name={name}
          checked={value}
          onChange={() => handle(!value, name)}
          className="accent-blue h-[18px] w-[18px]"
        />
        {label}
      </label>
    </div>
  );
}

export function PeriodInput({
  label,
  value,
  name = '',
  index = 0,
  full,
  handle,
}: {
  label: string;
  value: StepPeriod;
  name?: string;
  index?: number;
  full?: boolean;
  handle: Handle<StepPeriod>;
}) {
  return (
    <Cell label={label} full={full}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <input
          type="text"
          className="field !px-3"
          placeholder="2016"
          inputMode="numeric"
          value={value.od}
          onChange={(e) => handle({ ...value, od: e.target.value }, name, index)}
        />
        <span className="text-faint">—</span>
        <input
          type="text"
          className="field !px-3"
          placeholder="2027"
          inputMode="numeric"
          value={value.do}
          onChange={(e) => handle({ ...value, do: e.target.value }, name, index)}
        />
      </div>
    </Cell>
  );
}

/** Подзаголовок внутри формы («Отец», «Братья», «Среднее образование»). */
export function FormHead({ head }: { head: string }) {
  return (
    <h2 className="font-display text-ink mt-2 mb-0 text-[15px] font-semibold md:col-span-2">{head}</h2>
  );
}

/** Разделитель между повторяющимися блоками. */
export function FormHr() {
  return <hr className="my-1 border-0 border-t border-line md:col-span-2" />;
}

/** Подсказка-врезка внутри шага (в макете — серая или синяя плашка). */
export function FormNote({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <p className={`m-0 rounded-xl px-4 py-3 text-[13px] md:col-span-2 ${accent ? 'bg-tint text-blue-dark' : 'bg-mist text-muted'}`}>
      {children}
    </p>
  );
}
