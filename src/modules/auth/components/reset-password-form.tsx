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
import { useResetPassword } from '@/modules/auth/hooks/use-reset-password';

export const resetPasswordFormSchema = type({
  confirmPassword: 'string',
  password: '8<=string<=128',
}).narrow((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    return ctx.mustBe('Passwords must match');
  }
  return true;
});

type ResetPasswordFormData = typeof resetPasswordFormSchema.infer;

type ResetPasswordFormProps = {
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  token: string;
};

export function ResetPasswordForm({
  className,
  onError,
  onSuccess,
  token,
}: ResetPasswordFormProps) {
  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    resolver: arktypeResolver(resetPasswordFormSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(
      {
        newPassword: data.password,
        token,
      },
      {
        onSuccess: () => {
          toast.success('Password reset successful!', {
            description: 'You can now sign in with your new password.',
          });
          onSuccess?.();
        },
        onError: (error) => {
          const errorMessage =
            error.message ?? 'Failed to reset password. Please try again.';
          toast.error('Password reset failed', {
            description: errorMessage,
          });
          onError?.(errorMessage);
        },
      },
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Set New Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="new-password"
                      disabled={resetPasswordMutation.isPending}
                      placeholder="Enter your new password"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="new-password"
                      disabled={resetPasswordMutation.isPending}
                      placeholder="Confirm your new password"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              disabled={resetPasswordMutation.isPending}
              loading={resetPasswordMutation.isPending}
              loadingText="Resetting password..."
              type="submit"
            >
              Reset Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
