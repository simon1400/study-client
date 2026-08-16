/** Тёмная CTA-полоса в конце внутренних страниц (макеты «Программы», «Университет», «Статья»). */
export default function CtaBand({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cta-band">
      <div>
        <div className="cta-band-title">{title}</div>
        {text ? <div className="text-on-ink text-[15px]">{text}</div> : null}
      </div>
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap md:gap-3.5">{children}</div>
    </div>
  );
}
