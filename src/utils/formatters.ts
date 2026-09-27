/**
 * Utility functions for formatting data
 */

/** Format bytes to a human-readable size (e.g. "1.5 GB"). */
export function formatBytes(bytes: number | null | undefined, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'Unknown';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/** Format a date to a human-readable string. */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'en-US',
): string {
  if (!date) return 'Never';

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);
}

/** Format a progress percentage. */
export function formatProgress(progress: number | null | undefined): string {
  if (progress === null || progress === undefined) return '0%';
  return `${Math.round(Math.min(100, Math.max(0, progress)))}%`;
}

/** Format a duration in minutes (e.g. "2h 30m"). */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
