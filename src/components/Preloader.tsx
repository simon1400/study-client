import '@/styles/legacy/preload.scss';

/** Спиннер поверх страницы — старый `components/preload` (не путать с `user/Preload`). */
export default function Preloader() {
  return (
    <div className="preloader-fullscreen">
      <div uk-spinner="ratio: 3" />
    </div>
  );
}
