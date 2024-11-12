import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

import { TodoList, todoQueries } from '@/modules/todo';

export const Route = createFileRoute('/todo')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(todoQueries.list());
  },
});

function RouteComponent() {
  const { data } = useSuspenseQuery(todoQueries.list());

  return (
    <React.Fragment>
      <TodoList todos={data} />
    </React.Fragment>
  );
}
