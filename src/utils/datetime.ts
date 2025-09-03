import { format, formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * Get user's timezone from session metadata or browser
 */
export function getUserTimezone(sessionTimezone?: string | null): string {
  if (sessionTimezone) {
    return sessionTimezone;
  }

  // Fallback to browser timezone (client-side only)
  if (globalThis.window !== undefined) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // Server fallback to UTC
  return 'UTC';
}

/**
 * Format date in user's timezone
 * Safe to use in components with two-pass rendering pattern
 */
export function formatInUserTimezone(
  date: Date,
  pattern: string,
  userTimezone?: string | null,
): string {
  const timezone = getUserTimezone(userTimezone);

  try {
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, pattern);
  } catch {
    // Fallback to UTC if timezone is invalid
    return format(date, pattern);
  }
}

/**
 * Format relative time (no timezone issues)
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}
