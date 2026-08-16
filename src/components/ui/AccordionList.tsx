'use client';

import { useState } from 'react';

export type AccordionEntry = {
  id: string | number;
  title: string;
  /** Готовая разметка ответа: текст, richtext из Strapi или цена под ним. */
  content: React.ReactNode;
};

/**
 * Аккордеон страниц «Дополнительные услуги» и «FAQ» (макеты одинаковые).
 * По умолчанию раскрыт первый пункт — как в макете; повторный клик закрывает.
 */
export default function AccordionList({ items }: { items: AccordionEntry[] }) {
  const [open, setOpen] = useState<string | number | null>(items[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="accordion-item" data-open={isOpen}>
            <h3 className="m-0">
              <button
                type="button"
                className="accordion-trigger"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : item.id)}
              >
                <span>{item.title}</span>
                <Chevron open={isOpen} />
              </button>
            </h3>
            {/* раскрытие через grid-template-rows — высота не нужна, анимация плавная */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="accordion-panel">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="8"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
      className={`text-blue shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
