import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

import { TodoList, todoQueries, useTodo } from '@/modules/todo';

export const Route = createFileRoute('/todo')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(todoQueries.list());
  },
});

function RouteComponent() {
  const { data } = useTodo();

  return (
    <React.Fragment>
      <TodoList todos={data ?? []} />
    </React.Fragment>
  );
}
