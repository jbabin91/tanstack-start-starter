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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth/client';

export const forgotPasswordFormSchema = type({
  email: 'string.email>=1',
});

type ForgotPasswordFormData = typeof forgotPasswordFormSchema.infer;

type ForgotPasswordFormProps = {
  onSuccess?: () => void;
  className?: string;
};

/**
 * ForgotPasswordForm component provides password reset functionality.
 * Users can enter their email address to receive a password reset link.
 * Integrates with better-auth's email verification system.
 */
export function ForgotPasswordForm({
  onSuccess,
  className,
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
    resolver: arktypeResolver(forgotPasswordFormSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.forgetPassword({
        email: data.email,
        redirectTo: '/reset-password', // Adjust this URL based on your routing setup
      });

      if (result.error) {
        toast.error('Password reset failed', {
          description:
            result.error.message ??
            'Please check your email address and try again.',
        });
        return;
      }

      setIsEmailSent(true);
      toast.success('Password reset email sent!', {
        description:
          'Please check your email for instructions to reset your password.',
      });

      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Password reset failed', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    // Resubmit the form to send another reset email
    await onSubmit({ email });
  };

  const handleBackToForm = () => {
    setIsEmailSent(false);
    form.reset();
  };

  if (isEmailSent) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to{' '}
            <strong>{form.getValues('email')}</strong>
          </p>
          <p className="text-muted-foreground text-sm">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
              loadingText="Sending..."
              variant="outlined"
              onClick={handleResendEmail}
            >
              Resend email
            </Button>
            <Button
              className="w-full"
              disabled={isLoading}
              variant="text"
              onClick={handleBackToForm}
            >
              Back to form
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Reset your password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      aria-describedby="email-error email-description"
                      autoComplete="email"
                      disabled={isLoading}
                      placeholder="name@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormDescription id="email-description">
                    Enter the email address associated with your account and
                    we&apos;ll send you a link to reset your password.
                  </FormDescription>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
              loadingText="Sending reset link..."
              type="submit"
            >
              Send reset link
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
