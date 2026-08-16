/** Список городов в порядке появления — как делал старый ControlCity. */
export function uniqueCities(items: Array<{ city?: { title: string } | null }>): string[] {
  const seen: string[] = [];
  for (const item of items) {
    const title = item.city?.title;
    if (title && !seen.includes(title)) seen.push(title);
  }
  return seen;
}
