import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useState } from 'react';

import { Button } from '~/components/ui/button';

const deferredQueryOptions = () =>
  queryOptions({
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 3000));
      return {
        message: `Hello deferred from the server!`,
        status: 'success',
        time: new Date(),
      };
    },
    queryKey: ['deferred'],
  });

export const Route = createFileRoute('/deferred')({
  component: Deferred,
  loader: ({ context }) => {
    // Kick off loading as early as possible!
    context.queryClient.prefetchQuery(deferredQueryOptions());
  },
});

function Deferred() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-2">
      <Suspense fallback="Loading Middleman...">
        <DeferredQuery />
      </Suspense>
      <div>Count: {count}</div>
      <div>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
      </div>
    </div>
  );
}

function DeferredQuery() {
  const deferredQuery = useSuspenseQuery(deferredQueryOptions());

  return (
    <div>
      <h1>Deferred Query</h1>
      <div>Status: {deferredQuery.data.status}</div>
      <div>Message: {deferredQuery.data.message}</div>
      <div>Time: {deferredQuery.data.time.toISOString()}</div>
    </div>
  );
}
