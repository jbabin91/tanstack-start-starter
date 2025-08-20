import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ScrollArea } from '@/components/ui/scroll-area';

export type InfiniteScrollProps = {
  isLoading: boolean;
  hasMore: boolean;
  next: () => unknown;
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
  reverse?: boolean;
  children?: React.ReactNode;
  sentinelHeight?: number | string;
  sentinelClassName?: string;
} & Omit<React.ComponentProps<typeof ScrollArea>, 'children'>;

export function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = '0px',
  reverse = false,
  children,
  sentinelHeight = 32,
  sentinelClassName,
  ...scrollAreaProps
}: InfiniteScrollProps) {
  const { ref, inView } = useInView({
    root,
    rootMargin,
    threshold,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      next();
    }
  }, [inView, hasMore, isLoading, next]);

  return (
    <ScrollArea {...scrollAreaProps}>
      {reverse ? (
        <>
          {hasMore && (
            <div
              ref={ref}
              aria-label="infinite-scroll-sentinel"
              className={sentinelClassName}
              style={{ height: sentinelHeight }}
            />
          )}
          {children}
        </>
      ) : (
        <>
          {children}
          {hasMore && (
            <div
              ref={ref}
              aria-label="infinite-scroll-sentinel"
              className={sentinelClassName}
              style={{ height: sentinelHeight }}
            />
          )}
        </>
      )}
    </ScrollArea>
  );
}
