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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { todoCreateSchema } from '@/db/schema';
import { cn } from '@/lib/utils';
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
      <form
        className={cn(
          'content-center items-center space-y-4 sm:flex sm:gap-2 sm:space-y-0',
          className,
        )}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="w-full sm:min-w-72" placeholder="Add Todo Item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Add
        </Button>
      </form>
    </Form>
  );
}
