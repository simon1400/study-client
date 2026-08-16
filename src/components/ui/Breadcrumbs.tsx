import { Link } from '@/i18n/navigation';
import { absoluteUrl } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

/**
 * Хлебные крошки страниц-деталей: «Университеты / Брно».
 *
 * Рядом с видимой навигацией отдаётся BreadcrumbList — Google рисует по нему
 * путь вместо голого URL в выдаче. Адреса в разметке обязаны быть абсолютными,
 * поэтому компоненту нужны `locale` и путь текущей страницы.
 */
export default function Breadcrumbs({
  locale,
  parent,
  current,
  currentPath,
  home,
}: {
  locale: string;
  parent: { href: string; title: string };
  current?: string | null;
  /** Путь текущей страницы без локали, например `/blog/nostrifikace`. */
  currentPath?: string;
  /** Название первой ступени — главной. */
  home: string;
}) {
  const items = [
    { name: home, url: absoluteUrl(locale, '/') },
    { name: parent.title, url: absoluteUrl(locale, parent.href) },
    ...(current && currentPath ? [{ name: current, url: absoluteUrl(locale, currentPath) }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }}
      />
      <nav aria-label="breadcrumb" className="mb-5 text-sm md:mb-6">
        <Link href={parent.href} className="text-blue hover:text-blue-dark">
          {parent.title}
        </Link>
        {current ? <span className="text-faint"> / {current}</span> : null}
      </nav>
    </>
  );
}
