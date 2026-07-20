import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDate(
  date: string | Date | null | undefined,
  pattern = 'dd MMM yyyy',
): string {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? format(parsed, pattern) : '—';
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? formatDistanceToNow(parsed, { addSuffix: true }) : '—';
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function truncate(text: string, length = 50): string {
  return text.length <= length ? text : `${text.slice(0, length)}…`;
}
