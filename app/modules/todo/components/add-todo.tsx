import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
  zodResolver,
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { todoCreateSchema } from '@/db/schema';
import { cn } from '@/lib/utils.ts';
import { useCreateTodo } from '@/modules/todo/api';

type AddTodoProps = {
  className?: string;
};

export function AddTodo({ className }: AddTodoProps) {
  const mutation = useCreateTodo();

  const form = useForm<z.infer<typeof todoCreateSchema>>({
    defaultValues: { text: '' },
    resolver: zodResolver(todoCreateSchema),
  });

  function onSubmit(values: z.infer<typeof todoCreateSchema>) {
    mutation.mutate(values.text);
    form.reset();
  }

  return (
    <Form {...form}>
      <form className={cn('flex gap-2', className)} onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Add Todo Item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add</Button>
      </form>
    </Form>
  );
}
