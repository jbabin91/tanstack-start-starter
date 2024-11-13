import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type TodoModel } from '@/lib/db/schema';
import { AddTodo } from '@/modules/todo/components/add-todo';
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
            <ul className="space-y-2">
              {todos.map((todo) => (
                <Todo key={todo.id} todo={todo} />
              ))}
            </ul>
            <AddTodo className="mt-4" />
          </CardContent>
        </Card>
      </div>
    </React.Fragment>
  );
}
