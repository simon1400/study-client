import { Link } from '@/i18n/navigation';

/** Хлебные крошки страниц-деталей: «Университеты / Брно». */
export default function Breadcrumbs({
  parent,
  current,
}: {
  parent: { href: string; title: string };
  current?: string | null;
}) {
  return (
    <nav className="mb-5 text-sm md:mb-6">
      <Link href={parent.href} className="text-blue hover:text-blue-dark">
        {parent.title}
      </Link>
      {current ? <span className="text-faint"> / {current}</span> : null}
    </nav>
  );
}
