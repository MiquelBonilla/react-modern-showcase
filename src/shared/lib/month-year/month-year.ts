export function formatMonthYear(isoDate: string | undefined | null): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase()
    .replace(',', '');
}
