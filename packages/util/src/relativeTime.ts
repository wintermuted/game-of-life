export function formatRelativeTime(
  timestamp: number,
  i18nRelativeFormatter: (value: number, unit: Intl.RelativeTimeFormatUnit) => string,
): string {
  const elapsedMs = Date.now() - timestamp;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);

  if (elapsedMinutes < 1) return i18nRelativeFormatter(0, 'minute');
  if (elapsedMinutes < 60) return i18nRelativeFormatter(-elapsedMinutes, 'minute');

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return i18nRelativeFormatter(-elapsedHours, 'hour');

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return i18nRelativeFormatter(-elapsedDays, 'day');

  const elapsedWeeks = Math.floor(elapsedDays / 7);
  if (elapsedWeeks < 5) return i18nRelativeFormatter(-elapsedWeeks, 'week');

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedMonths < 12) return i18nRelativeFormatter(-elapsedMonths, 'month');

  const elapsedYears = Math.floor(elapsedDays / 365);
  return i18nRelativeFormatter(-elapsedYears, 'year');
}
