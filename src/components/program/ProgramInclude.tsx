'use client';

import { useState } from 'react';

export type IncludeTab = { id: string; label: string; items: string[] };

/**
 * «Что входит в программу» — пилюли-табы и список с галочками (макет
 * «Программа — деталь»). Раньше переключение делал `uk-filter` из UIkit.
 */
export default function ProgramInclude({ tabs }: { tabs: IncludeTab[] }) {
  const [active, setActive] = useState(0);
  if (!tabs.length) return null;

  const items = tabs[Math.min(active, tabs.length - 1)].items;

  return (
    <>
      {tabs.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2 md:mb-[26px]">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              className={`h-11 cursor-pointer rounded-full px-5 text-sm font-semibold transition-colors ${
                index === active
                  ? 'bg-blue border-0 text-white'
                  : 'text-body hover:border-blue border border-border bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-2.5">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3.5 rounded-2xl border border-line px-5 py-4">
            <span className="bg-tint text-blue mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              ✓
            </span>
            <span className="text-body text-[15px]">{item}</span>
          </div>
        ))}
      </div>
    </>
  );
}
