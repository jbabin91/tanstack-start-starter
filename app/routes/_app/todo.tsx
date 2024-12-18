import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

import { TodoList, todoQueries, useTodoSuspense } from '@/modules/todo';

export const Route = createFileRoute('/_app/todo')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(todoQueries.list());
  },
});

function RouteComponent() {
  const { data } = useTodoSuspense();

  return (
    <React.Fragment>
      <TodoList todos={data ?? []} />
    </React.Fragment>
  );
}
