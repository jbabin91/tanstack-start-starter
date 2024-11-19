import { Link } from '@tanstack/react-router';

import { Button, buttonVariants } from '@/components/ui/button.tsx';
import { Typography } from '@/components/ui/typography.tsx';

export function NotFound() {
  return (
    <div className="flex flex-col items-center space-y-4 p-2 text-center">
      <Typography.H1>404</Typography.H1>
      <Typography.P>The page you are looking for does not exist.</Typography.P>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => globalThis.history.back()}>Go back</Button>
        <Link className={buttonVariants({ variant: 'outline' })} to="/">
          Start Over
        </Link>
      </div>
    </div>
  );
}
