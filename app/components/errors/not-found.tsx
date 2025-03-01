import { Link, type NotFoundRouteProps } from '@tanstack/react-router';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';

type NotFoundData = {
  title?: string;
  description?: string;
};

export function NotFound({ data }: NotFoundRouteProps) {
  const notFoundData = data as NotFoundData | undefined;
  const title = notFoundData?.title ?? 'Page Not Found';
  const description =
    notFoundData?.description ?? 'The page you are looking for does not exist.';

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">{title}</h2>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                globalThis.history.back();
              }}
            >
              Go Back
            </Button>
            <Button asChild variant="secondary">
              <Link to="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
