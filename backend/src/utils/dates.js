export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
export function withinDays(dateStr, n) {
  const d = new Date(dateStr);
  return Date.now() - d.getTime() <= n * 24 * 3600 * 1000;
}
export const todayISO = () => new Date().toISOString();

