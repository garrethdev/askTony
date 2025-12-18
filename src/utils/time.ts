/**
 * Get ISO date (YYYY-MM-DD) in a given time zone for a Date.
 */
export const toDateInZone = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value;
      return acc;
    }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};

/**
 * Compute week start (Monday) for a given date in a time zone.
 */
export const weekStartMonday = (date: Date, timeZone: string): string => {
  const localDateStr = toDateInZone(date, timeZone);
  const [year, month, day] = localDateStr.split('-').map(Number);
  const local = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = local.getUTCDay(); // 0=Sun
  const diff = (dayOfWeek + 6) % 7; // days since Monday
  const monday = new Date(local);
  monday.setUTCDate(local.getUTCDate() - diff);
  return monday.toISOString().slice(0, 10);
};

