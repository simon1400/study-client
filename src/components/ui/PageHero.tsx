/**
 * Шапка внутренней страницы по макетам редизайна: светлая полоса Mist,
 * надзаголовок, H1 и лид. В `children` кладутся табы фильтра, если они есть.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-mist pt-9 pb-8 md:pt-14 md:pb-12">
      <div className="container-page">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1 className="h1-page mb-3 md:mb-3.5">{title}</h1>
        {lead ? <p className="lead max-w-[600px]">{lead}</p> : null}
        {children ? <div className="mt-6 md:mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
