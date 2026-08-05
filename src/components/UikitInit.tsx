'use client';

import { useEffect } from 'react';

/**
 * Старая вёрстка держится на UIkit-атрибутах (uk-tooltip, uk-dropdown, uk-close…),
 * поэтому JS UIkit подключается на клиенте — как раньше через CDN в index.html.
 */
export default function UikitInit() {
  useEffect(() => {
    Promise.all([import('uikit'), import('uikit/dist/js/uikit-icons')]).then(([uikit, icons]) => {
      const UIkit = uikit.default;
      // eslint-disable-next-line react-hooks/rules-of-hooks -- это UIkit.use, а не React-хук
      UIkit.use(icons.default);
      // старый код звал window.UIkit.modal(...) — оставляем тот же доступ
      (window as unknown as { UIkit: typeof UIkit }).UIkit = UIkit;
    });
  }, []);

  return null;
}
