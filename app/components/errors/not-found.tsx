import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-2 p-2">
      <div className="text-gray-600 dark:text-gray-400">
        {children ?? <p>The page you are looking for does not exist.</p>}
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <Button onClick={() => globalThis.history.back()}>Go back</Button>
        <Link
          className="rounded bg-cyan-600 px-2 py-1 text-sm font-black uppercase text-white"
          to="/"
        >
          Start Over
        </Link>
      </p>
    </div>
  );
}