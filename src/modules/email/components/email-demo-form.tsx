import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { sendDemoEmailFn } from '@/modules/email/api/send-demo-email';

export const formDemoSchema = type({
  email: 'string.email>=1',
});

export function EmailDemoForm() {
  const form = useForm<typeof formDemoSchema.infer>({
    defaultValues: {
      email: '',
    },
    resolver: arktypeResolver(formDemoSchema),
  });

  async function onSubmit(data: typeof formDemoSchema.infer) {
    await sendDemoEmailFn({ data })
      .then(() => {
        toast.success('You submitted the following values', {
          description: (
            <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
              <code className="text-white">
                {JSON.stringify(data, null, 2)}
              </code>
            </pre>
          ),
        });
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        toast.error('Failed to send email. Please try again later.');
        return;
      });
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Form Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="w-2/3 space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
