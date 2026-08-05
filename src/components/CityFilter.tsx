/**
 * Переключатель городов над списками. Фильтрацию делает сам UIkit
 * (uk-filter на контейнере + uk-filter-control на пунктах), как и раньше.
 */
export default function CityFilter({ cities }: { cities: string[] }) {
  if (!cities.length) return null;

  return (
    <div className="uk-grid uk-child-width-1-1">
      <div>
        <ul className="city_switch">
          {cities.map((city, index) => (
            <li
              key={city}
              className={index === 0 ? 'uk-active' : ''}
              uk-filter-control={`[data-city='${city}'], [data-city='all']`}
            >
              {city}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Список городов в порядке появления — как делал старый ControlCity. */
export function uniqueCities(items: Array<{ city?: { title: string } | null }>): string[] {
  const seen: string[] = [];
  for (const item of items) {
    const title = item.city?.title;
    if (title && !seen.includes(title)) seen.push(title);
  }
  return seen;
}
