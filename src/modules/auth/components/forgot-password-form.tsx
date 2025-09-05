import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Icons } from '@/components/icons';
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
import { useForgotPassword } from '@/modules/auth/hooks/use-forgot-password';
import { useSendEmailVerificationOTP } from '@/modules/auth/hooks/use-send-email-verification-otp';

import { OTPVerificationForm } from './otp-verification-form';

export const forgotPasswordFormSchema = type({
  email: 'string.email>=1',
});

type ForgotPasswordFormData = typeof forgotPasswordFormSchema.infer;

type ForgotPasswordFormProps = {
  onSuccess?: () => void;
  className?: string;
};

export function ForgotPasswordForm({
  onSuccess,
  className,
}: ForgotPasswordFormProps) {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const forgotPasswordMutation = useForgotPassword();
  const sendOTPMutation = useSendEmailVerificationOTP();

  const form = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
    resolver: arktypeResolver(forgotPasswordFormSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(
      {
        email: data.email,
        redirectTo: '/reset-password', // Adjust this URL based on your routing setup
      },
      {
        onSuccess: () => {
          setIsEmailSent(true);
          toast.success('Password reset email sent!', {
            description:
              'Please check your email for instructions to reset your password.',
          });
          // Call success callback if provided
          onSuccess?.();
        },
        onError: (error) => {
          toast.error('Password reset failed', {
            description:
              error.message ?? 'Please check your email address and try again.',
          });
        },
      },
    );
  };

  const handleResendEmail = () => {
    const email = form.getValues('email');
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    // Resubmit the form to send another reset email
    onSubmit({ email });
  };

  const handleBackToForm = () => {
    setIsEmailSent(false);
    setShowOTP(false);
    form.reset();
  };

  const handleSendOTP = (email: string) => {
    sendOTPMutation.mutate(
      {
        email,
        type: 'forget-password',
      },
      {
        onSuccess: () => {
          toast.success('Reset code sent!', {
            description: 'Check your email for the password reset code.',
          });
          setShowOTP(true);
        },
        onError: (error) => {
          toast.error('Failed to send reset code', {
            description:
              error.message ?? 'Please check your email and try again.',
          });
        },
      },
    );
  };

  const handleOTPSuccess = (_data?: unknown) => {
    // OTP verification successful - now send them a password reset email
    toast.success('Code verified successfully!', {
      description: 'Sending you a password reset link...',
    });

    const email = form.getValues('email');

    // Send the password reset email since OTP is verified
    forgotPasswordMutation.mutate(
      {
        email,
        redirectTo: '/reset-password',
      },
      {
        onSuccess: () => {
          toast.success('Password reset link sent!', {
            description: 'Check your email for the password reset link.',
          });
          // Show the email sent state
          setShowOTP(false);
          setIsEmailSent(true);
        },
        onError: (error) => {
          toast.error('Failed to send reset link', {
            description: error.message ?? 'Please try again.',
          });
        },
      },
    );
  };

  const handleBackToEmail = () => {
    setShowOTP(false);
  };

  if (showOTP) {
    const email = form.getValues('email');
    if (!email) {
      setShowOTP(false);
      return null;
    }

    return (
      <div className="space-y-4">
        <OTPVerificationForm
          email={email}
          type="forget-password"
          onSuccess={handleOTPSuccess}
        />
        <div className="text-center">
          <button
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            type="button"
            onClick={handleBackToEmail}
          >
            <Icons.chevronLeft className="mr-1 inline size-3" />
            Use email link instead
          </button>
        </div>
      </div>
    );
  }

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
            Didn&apos;t receive the email? Check your spam folder or use one of
            the options below.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full"
              disabled={
                forgotPasswordMutation.isPending || sendOTPMutation.isPending
              }
              loading={
                forgotPasswordMutation.isPending || sendOTPMutation.isPending
              }
              loadingText="Sending..."
              variant="outlined"
              onClick={handleResendEmail}
            >
              Resend email
            </Button>
            <div className="text-muted-foreground text-sm">or</div>
            <Button
              className="w-full"
              disabled={
                forgotPasswordMutation.isPending || sendOTPMutation.isPending
              }
              loading={
                forgotPasswordMutation.isPending || sendOTPMutation.isPending
              }
              loadingText="Sending..."
              variant="outlined"
              onClick={() => handleSendOTP(form.getValues('email'))}
            >
              Get reset code instead
            </Button>
            <Button
              className="w-full"
              disabled={
                forgotPasswordMutation.isPending || sendOTPMutation.isPending
              }
              variant="ghost"
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
                      disabled={
                        forgotPasswordMutation.isPending ||
                        sendOTPMutation.isPending
                      }
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
              disabled={
                forgotPasswordMutation.isPending || sendOTPMutation.isPending
              }
              loading={
                forgotPasswordMutation.isPending || sendOTPMutation.isPending
              }
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
