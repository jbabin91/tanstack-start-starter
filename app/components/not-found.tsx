import { useNavigate } from '@tanstack/react-router';

import { Button } from '~/components/ui/button';

export function NotFound({ children }: { children?: any }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2 p-2">
      <div className="text-gray-600 dark:text-gray-400">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <Button className="uppercase" onClick={() => globalThis.history.back()}>
          Go back
        </Button>
        <Button
          className="uppercase"
          variant="secondary"
          onClick={() => navigate({ to: '/' })}
        >
          Start Over
        </Button>
      </p>
    </div>
  );
}
