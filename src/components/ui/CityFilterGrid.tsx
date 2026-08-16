'use client';

import { useState } from 'react';

export type FilterItem = { id: string | number; city: string | null; node: React.ReactNode };

/**
 * Списки университетов, программ и общежитий с переключателем городов.
 *
 * Раньше фильтровал `uk-filter` из UIkit; в редизайне это обычные пилюли-табы
 * (макет «Университеты»), поэтому фильтрация переехала в состояние React.
 * Карточки приходят готовой разметкой из серверного компонента — в клиент
 * уезжает только логика переключения.
 *
 * Записи без города видны всегда: так же вёл себя `data-city="all"` в старой вёрстке.
 */
export default function CityFilterGrid({
  cities,
  items,
  className = 'grid gap-5 md:grid-cols-2 md:gap-6',
  tabsSlot,
}: {
  cities: string[];
  items: FilterItem[];
  className?: string;
  /** Куда отрисовать сами табы — если нужно поднять их в шапку страницы. */
  tabsSlot?: 'inline' | 'none';
}) {
  const [active, setActive] = useState(cities[0] ?? null);

  const visible = active ? items.filter((i) => !i.city || i.city === active) : items;

  return (
    <>
      {cities.length > 1 && tabsSlot !== 'none' ? (
        <div className="mb-6 flex flex-wrap gap-2 md:mb-8">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setActive(city)}
              aria-pressed={city === active}
              className={`cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                city === active
                  ? 'border-blue bg-blue text-white'
                  : 'border-border hover:border-blue bg-white text-body'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}

      <div className={className}>
        {visible.map((item) => (
          <div key={item.id} className="contents">
            {item.node}
          </div>
        ))}
      </div>
    </>
  );
}
