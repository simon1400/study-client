import '@/styles/legacy/user-preload.scss';

/** Спиннер на всю область — старый `routes/user/components/preload`. */
export default function Preload() {
  return (
    <div className="preloader">
      <div uk-spinner="ratio: 3" />
    </div>
  );
}
