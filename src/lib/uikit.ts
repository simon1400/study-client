/**
 * Управление модалками UIkit из React — то же, что делал `toggleModal` в старом
 * `header.js` (`window.UIkit.modal(window.UIkit.util.find(...))`). Экземпляр UIkit
 * кладёт в window компонент `UikitInit`, поэтому до его загрузки вызовы молчат.
 */
type UIkitModal = { show(): void; hide(): void };
type UIkitGlobal = {
  modal(element: string | Element): UIkitModal;
  util: { find(selector: string): Element | null };
};

function uikit(): UIkitGlobal | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { UIkit?: UIkitGlobal }).UIkit ?? null;
}

function withModal(selector: string, action: (modal: UIkitModal) => void) {
  const UIkit = uikit();
  const element = UIkit?.util.find(selector);
  if (!UIkit || !element) return;
  action(UIkit.modal(element));
}

export function showModal(selector: string) {
  withModal(selector, (modal) => modal.show());
}

export function hideModal(selector: string) {
  withModal(selector, (modal) => modal.hide());
}
