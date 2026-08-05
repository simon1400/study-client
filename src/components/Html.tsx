/**
 * richtext-поля Strapi хранят HTML (миграция Portable Text → HTML, этап 3).
 * Разметка целиком наша, из CMS, поэтому вставляем как есть — как делал
 * BlockContent на старом сайте.
 */
export default function Html({ html, className }: { html?: string | null; className?: string }) {
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
