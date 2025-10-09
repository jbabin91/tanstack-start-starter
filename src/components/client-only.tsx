import { useSyncExternalStore } from 'react';

type ClientOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

// External store that tracks client-side mounting
const emptySubscribe = () => {
  // No-op unsubscribe function
  return () => {
    // No cleanup needed
  };
};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Renders children only on the client side to avoid hydration mismatches
 * Useful for timezone-sensitive dates, user-specific content, etc.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
