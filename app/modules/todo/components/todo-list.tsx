import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { type TodoModel } from '@/db/schema';
import { AddTodo } from '@/modules/todo/components/add-todo.tsx';
import { Todo } from '@/modules/todo/components/todo.tsx';

type TodoListProps = {
  todos: TodoModel[];
};

export function TodoList({ todos }: TodoListProps) {
  return (
    <React.Fragment>
      <Card className="min-w-sm w-full sm:mx-auto sm:max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {todos.map((todo) => (
              <Todo key={todo.id} todo={todo} />
            ))}
          </ul>
          <AddTodo className="mt-4" />
        </CardContent>
      </Card>
    </React.Fragment>
  );
}
