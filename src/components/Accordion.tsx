'use client';

/* eslint-disable @next/next/no-img-element -- статика из public/ */
import { useState } from 'react';
import '@/styles/accordion.scss';

export type AccordionItem = { id: number; title: string; html: string | null };

/**
 * Раскрывающиеся блоки FAQ и доп. услуг. Раньше это был react-animate-height,
 * теперь то же раскрытие на CSS (grid-template-rows), разметка прежняя.
 */
export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="dop-uslug">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="dop_uslug-item">
            <div className="uslug-head" onClick={() => setOpenId(open ? null : item.id)}>
              <h2 className={open ? 'open_head' : ''}>
                {item.title} <img src="/angle-right-light.svg" alt="arrow" />
              </h2>
            </div>
            <div className={`uslug-collapse ${open ? 'is-open' : ''}`}>
              <div>
                <div className="uslug-content" dangerouslySetInnerHTML={{ __html: item.html ?? '' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
