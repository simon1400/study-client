'use client';

import '@/styles/legacy/user-form_footer.scss';
import '@/styles/legacy/user-done.scss';
import '@/styles/legacy/user-button_control_form.scss';

/**
 * Мелочи, общие для форм анкеты: кнопка сохранения, экран «шаг заполнен»
 * и управление повторяемыми блоками. Разметка — из `routes/user/components/*`.
 */

export function StepFooter({ onSave, saving, error }: { onSave: () => void; saving: boolean; error: boolean }) {
  return (
    <div className="form_footer">
      {error ? (
        <div className="uk-alert-danger" uk-alert="">
          <p>Не удалось сохранить. Обновите страницу и попробуйте снова.</p>
        </div>
      ) : null}
      <div className="uk-grid uk-child-width-1-2" uk-grid="">
        <div />
        <div>
          <button className="uk-button uk-button-default" type="button" onClick={onSave} disabled={saving}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

/** Экран вместо формы, если шаг уже заполнен; «Изменить» возвращает форму. */
export function StepDone({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="content_panel">
      <div className="panel_item panel_item_done uk-flex-middle uk-flex">
        <div className="uk-flex uk-flex-center uk-flex-middle uk-width-1-1">
          <div className="modal-done-wrap">
            <div className="big-circle-done" />
            <h2>Этот шаг анкеты заполнен!</h2>
            <button className="button button_blue" type="button" onClick={onEdit}>
              Изменить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** «Добавить» / «Отмена» под повторяемым блоком (братья, сёстры, учебные заведения). */
export function ButtonControl({
  count,
  onAdd,
  onRemove,
}: {
  count: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <div className="uk-grid uk-child-width-1-2">
        <div />
        <div>
          <div className={`button_control_wrap ${count ? 'button_count' : ''}`}>
            <div className="uk-grid uk-child-width-1-2">
              {count ? (
                <div>
                  <button className="button_remove_item" type="button" onClick={onRemove}>
                    Отмена
                  </button>
                </div>
              ) : null}
              <div>
                <button className="button_add_item" type="button" onClick={onAdd}>
                  Добавить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
