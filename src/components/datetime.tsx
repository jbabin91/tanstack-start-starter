import { formatDistanceToNow } from 'date-fns';
import { useMemo, useSyncExternalStore } from 'react';

import { formatInUserTimezone, getUserTimezone } from '@/utils/datetime';

// External store that tracks client-side mounting
const emptySubscribe = () => {
  // No-op unsubscribe function
  return () => {
    // No cleanup needed
  };
};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

type RelativeTimeProps = {
  date: Date;
  className?: string;
};

/**
 * Always safe - relative time has no timezone issues
 */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  return (
    <time className={className} dateTime={date.toISOString()}>
      {formatDistanceToNow(date, { addSuffix: true })}
    </time>
  );
}

type AbsoluteTimeProps = {
  date: Date;
  pattern?: string;
  timezone?: string;
  fallback?: string;
  className?: string;
};

/**
 * Timezone-aware absolute time - uses two-pass rendering for hydration safety
 */
export function AbsoluteTime({
  date,
  pattern = 'MMM d, yyyy h:mm a',
  timezone,
  fallback = '---',
  className,
}: AbsoluteTimeProps) {
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Compute formatted date on client side
  const clientFormattedDate = useMemo(() => {
    if (!hasMounted) return null;
    const userTimezone = getUserTimezone(timezone);
    return formatInUserTimezone(date, pattern, userTimezone);
  }, [hasMounted, date, pattern, timezone]);

  const displayText =
    hasMounted && clientFormattedDate ? clientFormattedDate : fallback;

  return (
    <time
      suppressHydrationWarning
      className={className}
      dateTime={date.toISOString()}
    >
      {displayText}
    </time>
  );
}

type DateTimeProps = {
  date: Date;
  showRelative?: boolean;
  showAbsolute?: boolean;
  pattern?: string;
  timezone?: string;
  className?: string;
};

/**
 * Flexible datetime component - shows both relative and absolute by default
 */
export function DateTime({
  date,
  showRelative = true,
  showAbsolute = true,
  pattern = 'MMM d, yyyy h:mm a',
  timezone,
  className,
}: DateTimeProps) {
  if (showRelative && !showAbsolute) {
    return <RelativeTime className={className} date={date} />;
  }

  if (showAbsolute && !showRelative) {
    return (
      <AbsoluteTime
        className={className}
        date={date}
        pattern={pattern}
        timezone={timezone}
      />
    );
  }

  // Show both - relative as fallback, absolute when mounted
  return (
    <AbsoluteTime
      className={className}
      date={date}
      fallback={formatDistanceToNow(date, { addSuffix: true })}
      pattern={pattern}
      timezone={timezone}
    />
  );
}
