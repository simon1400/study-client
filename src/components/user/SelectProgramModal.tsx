'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { hideModal } from '@/lib/uikit';
import '@/styles/legacy/modal-select-program.scss';
import ModalPortal from '@/components/modals/ModalPortal';

/**
 * Выбор программы обучения в ЛК (старая `components/modals/select-program`).
 * Список программ приходит из Strapi серверным рендером страницы, а не
 * отдельным запросом к CMS с клиента, как было на Sanity.
 */

export type ProgramOption = { title: string; price: string; dateCourse: string };

export default function SelectProgramModal({
  programs,
  selected,
}: {
  programs: ProgramOption[];
  selected: string | null;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<ProgramOption | null>(
    programs.find((program) => program.title === selected) ?? null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function submit() {
    if (!choice) return;
    setSaving(true);
    setError(false);
    try {
      const res = await fetch('/api/account/program', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programm: choice.title,
          price: choice.price,
          dateCourse: choice.dateCourse,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      hideModal('#modal-select-program');
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalPortal>
      <div id="modal-select-program" className="select-program-modal" uk-modal="">
        <div className="uk-modal-dialog">
          <button className="uk-modal-close-default" type="button" uk-close="" />

          <div className="uk-modal-header">
            <h2 className="uk-modal-title">ВЫБОР ПРОГРАММЫ</h2>
          </div>

          <div className="uk-modal-body" uk-overflow-auto="">
            {error ? (
              <div className="uk-alert-danger" uk-alert="">
                <p>Не удалось сохранить программу. Попробуйте ещё раз.</p>
              </div>
            ) : null}
            {programs.map((program) => (
              <div className="uk-grid-small" key={program.title} uk-grid="">
                <div className="uk-width-expand" uk-leader="">
                  <label>
                    <input
                      type="radio"
                      name="program"
                      checked={choice?.title === program.title}
                      onChange={() => setChoice(program)}
                    />
                    {program.title}
                  </label>
                </div>
                <div>{program.price}</div>
              </div>
            ))}
          </div>

          <div className="uk-modal-footer">
            <button className="button_remove_item uk-modal-close" type="button">
              Отмена
            </button>
            <button
              className="uk-button uk-button-default uk-align-right"
              type="button"
              onClick={submit}
              disabled={saving || !choice}
            >
              Выбрать
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
