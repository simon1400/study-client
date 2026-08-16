/**
 * Разметка schema.org для поисковиков. `<` экранируется, чтобы текст из CMS
 * не смог закрыть тег и вылезти из скрипта.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
