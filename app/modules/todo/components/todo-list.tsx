import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type TodoModel } from '@/lib/db/schema';
import { Todo } from '@/modules/todo/components/todo';

type TodoListProps = {
  todos: TodoModel[];
};

export function TodoList({ todos }: TodoListProps) {
  return (
    <React.Fragment>
      <div className="flex justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Todo List</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {todos.map((todo) => (
                <Todo key={todo.id} todo={todo} />
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </React.Fragment>
  );
}
