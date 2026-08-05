'use client';

/**
 * Пункт меню, который не ведёт по ссылке, а что-то делает («Выйти», «Изменить пароль»).
 * В старой вёрстке это был `<a nohref="" onClick=…>`; тег `a` сохраняем, потому что
 * стили выпадашки и сайдбара ЛК написаны на селектор `a`, а доступность добираем
 * ролью и обработчиком клавиатуры.
 */
export default function LinkButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <a
      role="button"
      tabIndex={0}
      className={className}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </a>
  );
}
