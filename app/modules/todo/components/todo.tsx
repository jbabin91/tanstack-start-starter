import { Label } from '@radix-ui/react-dropdown-menu';
import { Check, SquarePen, X } from 'lucide-react';
import * as React from 'react';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useForm,
  zodResolver,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type TodoModel, todoUpdateSchema } from '@/db/schema';
import { useDeleteTodo, useUpdateTodo } from '@/modules/todo/api';

type TodoProps = {
  todo: TodoModel;
};

export function Todo({ todo }: TodoProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  const { mutate: deleteTodo } = useDeleteTodo();

  function toggleEdit() {
    setIsEditing((prev) => !prev);
  }

  function handleDelete() {
    deleteTodo(todo.id);
  }

  return (
    <React.Fragment>
      {isEditing ? (
        <UpdateTodoForm todo={todo} toggleEdit={toggleEdit} />
      ) : (
        <li className="flex min-w-80 justify-between">
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Label className="font-semibold">Task:</Label>
              <p className="text-sm">{todo.text}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-semibold">Done:</Label>
              <p className="text-sm">{todo.done ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={toggleEdit}>
              <SquarePen className="size-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={handleDelete}>
              <X className="size-4 text-red-500" />
            </Button>
          </div>
        </li>
      )}
    </React.Fragment>
  );
}

type UpdateTodoFormProps = {
  todo: Omit<TodoModel, 'createdAt' | 'updatedAt'>;
  toggleEdit: () => void;
};

function UpdateTodoForm({ todo, toggleEdit }: UpdateTodoFormProps) {
  const { mutate: updateTodo } = useUpdateTodo();

  const form = useForm<z.infer<typeof todoUpdateSchema>>({
    defaultValues: todo,
    resolver: zodResolver(todoUpdateSchema),
  });

  function onSubmit(values: z.infer<typeof todoUpdateSchema>) {
    updateTodo({ ...values, id: todo.id });
    toggleEdit();
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormLabel>Task</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="done"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="text-sm font-normal">Done</FormLabel>
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button size="icon" type="submit" variant="outline">
            <Check className="size-4" />
          </Button>
          <Button size="icon" onClick={toggleEdit}>
            <X className="size-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
