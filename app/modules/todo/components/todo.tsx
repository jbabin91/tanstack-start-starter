import { Label } from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

import { type TodoModel } from '@/lib/db/schema';

type TodoProps = {
  todo: TodoModel;
};

export function Todo({ todo }: TodoProps) {
  return (
    <React.Fragment>
      <li className="flex gap-2">
        <div className="flex items-center gap-2">
          <Label className="font-semibold">Task:</Label>
          <p className="text-sm">{todo.text}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="font-semibold">Done:</Label>
          <p className="text-sm">{todo.done ? 'Yes' : 'No'}</p>
        </div>
      </li>
    </React.Fragment>
  );
}
