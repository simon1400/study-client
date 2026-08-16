/**
 * Карта офиса (секция «Контакты» на главной и страница /contacts).
 * По решению пользователя (2026-08-16) показывается всегда — как в макете редизайна.
 * `loading="lazy"` откладывает загрузку iframe до подхода к вьюпорту, чтобы не терять
 * целиком оптимизацию LCP из этапа 8.
 */
export default function MapSection({
  mid = '1yY8eiTQPebST_CY0i1KFJ4Vq_YXEq4Vg',
  className = '',
}: {
  mid?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-panel min-h-[320px] overflow-hidden border border-line bg-white md:min-h-[380px] ${className}`}
    >
      <iframe
        title="Mapa"
        src={`https://www.google.com/maps/d/u/0/embed?mid=${mid}`}
        width="100%"
        height="428"
        loading="lazy"
        className="-mt-12 block border-0"
      />
    </div>
  );
}
