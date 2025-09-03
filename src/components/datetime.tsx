import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

import { formatInUserTimezone, getUserTimezone } from '@/utils/datetime';

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
  const [hasMounted, setHasMounted] = useState(false);
  const [clientFormattedDate, setClientFormattedDate] = useState<string | null>(
    null,
  );

  // Server-side and first client render: show fallback
  // Second client render: show properly formatted date
  useEffect(() => {
    setHasMounted(true);
    const userTimezone = getUserTimezone(timezone);
    const formatted = formatInUserTimezone(date, pattern, userTimezone);
    setClientFormattedDate(formatted);
  }, [date, pattern, timezone]);

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
