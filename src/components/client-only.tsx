import { useEffect, useState } from 'react';

type ClientOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Renders children only on the client side to avoid hydration mismatches
 * Useful for timezone-sensitive dates, user-specific content, etc.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
