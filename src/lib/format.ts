/**
 * Format a Date for display.
 * @param date - The date to format
 * @param monthStyle - 'long' (January) or 'short' (Jan). Defaults to 'long'.
 */
export function formatDate(date: Date, monthStyle: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: monthStyle,
    day: 'numeric',
  });
}
