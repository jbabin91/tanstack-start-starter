'use client';

import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useState } from 'react';
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
import { authClient } from '@/lib/auth/client';

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

/**
 * ResetPasswordForm component allows users to set a new password
 * using a valid reset token received via email.
 * Integrates with better-auth's password reset system.
 */
export function ResetPasswordForm({
  className,
  onError,
  onSuccess,
  token,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    resolver: arktypeResolver(resetPasswordFormSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        const errorMessage =
          result.error.message ?? 'Failed to reset password. Please try again.';
        toast.error('Password reset failed', {
          description: errorMessage,
        });
        onError?.(errorMessage);
        return;
      }

      toast.success('Password reset successful!', {
        description: 'You can now sign in with your new password.',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      toast.error('Password reset failed', {
        description: errorMessage,
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
              disabled={isLoading}
              loading={isLoading}
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
