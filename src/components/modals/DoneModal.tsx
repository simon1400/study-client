'use client';

import '@/styles/legacy/modal-done.scss';
import ModalPortal from './ModalPortal';

/**
 * Короткое «готово» на весь экран — раньше `components/modals/done`.
 * Используется после смены пароля и после заявки на звонок.
 */
export default function DoneModal({ id, label }: { id: string; label: string }) {
  return (
    <ModalPortal>
      <div id={id} className="modal uk-modal-full uk-modal" uk-modal="">
        <div className="uk-modal-dialog uk-height-1-1 uk-flex uk-flex-middle">
          <button className="uk-modal-close-full uk-close-large" type="button" uk-close="" />
          <div className="uk-flex uk-flex-center uk-flex-middle uk-width-1-1 uk-height-1-1">
            <div className="modal-done-wrap modal-call-done">
              <div className="big-circle-done" />
              <p>{label}</p>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
