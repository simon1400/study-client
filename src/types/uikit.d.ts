import 'react';

/**
 * Старая вёрстка вешает поведение UIkit через html-атрибуты `uk-*`.
 * React их пропускает как есть, но TS про них не знает — объявляем.
 */
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- параметр нужен, чтобы слиться с исходным интерфейсом
  interface HTMLAttributes<T> {
    'uk-accordion'?: string;
    'uk-alert'?: string;
    'uk-close'?: string;
    'uk-cover'?: string;
    'uk-dropdown'?: string;
    'uk-filter'?: string;
    'uk-filter-control'?: string;
    'uk-grid'?: string;
    'uk-height-match'?: string;
    'uk-form-custom'?: string;
    'uk-icon'?: string;
    'uk-leader'?: string;
    'uk-modal'?: string;
    'uk-overflow-auto'?: string;
    'uk-scrollspy'?: string;
    'uk-switcher'?: string;
    'uk-lightbox'?: string;
    'uk-slider'?: string;
    'uk-slideshow'?: string;
    'uk-slideshow-item'?: string;
    'uk-switcher-item'?: string;
    'uk-tab'?: string;
    'uk-spinner'?: string;
    'uk-sticky'?: string;
    'uk-toggle'?: string;
    'uk-tooltip'?: string;
  }
}
