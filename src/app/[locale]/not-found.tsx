import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <section className="archive-page">
      <div className="uk-container">
        <div className="content-wrap uk-text-center">
          <h1>Страница не найдена</h1>
          <p>
            Возможно, адрес изменился или страница удалена.{' '}
            <Link href="/">Вернуться на главную</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
