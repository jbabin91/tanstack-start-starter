import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Icons } from '@/components/icons';
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import { useSignInWithOTP } from '@/modules/auth/hooks/use-sign-in-with-otp';
import { useVerifyEmailWithOTP } from '@/modules/auth/hooks/use-verify-email-with-otp';

export const otpVerificationFormSchema = type({
  otp: 'string>=6',
});

type OTPVerificationFormData = typeof otpVerificationFormSchema.infer;

type OTPVerificationType = 'sign-in' | 'email-verification' | 'forget-password';

type OTPVerificationFormProps = {
  email: string;
  type: OTPVerificationType;
  onSuccess?: (data?: unknown) => void;
  onResend?: () => void;
  className?: string;
  title?: string;
  description?: string;
  variant?: 'card' | 'inline';
};

function getDefaultTitle(type: OTPVerificationType): string {
  switch (type) {
    case 'sign-in': {
      return 'Enter your sign-in code';
    }
    case 'email-verification': {
      return 'Verify your email';
    }
    case 'forget-password': {
      return 'Enter reset code';
    }
    default: {
      return 'Enter verification code';
    }
  }
}

function getDefaultDescription(
  type: OTPVerificationType,
  email: string,
): string {
  switch (type) {
    case 'sign-in': {
      return `We've sent a sign-in code to ${email}. Enter the code below to continue.`;
    }
    case 'email-verification': {
      return `We've sent a verification code to ${email}. Enter the code below to verify your email address.`;
    }
    case 'forget-password': {
      return `We've sent a password reset code to ${email}. Enter the code below to continue.`;
    }
    default: {
      return `We've sent a verification code to ${email}. Enter the code below to continue.`;
    }
  }
}

/**
 * OTPVerificationForm component provides OTP verification functionality.
 * Supports different types of OTP verification: sign-in, email verification, and password reset.
 */
export function OTPVerificationForm({
  email,
  type,
  onSuccess,
  onResend,
  className,
  title,
  description,
  variant = 'card',
}: OTPVerificationFormProps) {
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const signInWithOTPMutation = useSignInWithOTP();
  const verifyEmailWithOTPMutation = useVerifyEmailWithOTP();

  const form = useForm<OTPVerificationFormData>({
    defaultValues: {
      otp: '',
    },
    resolver: arktypeResolver(otpVerificationFormSchema),
  });

  const onSubmit = useCallback(
    (data: OTPVerificationFormData) => {
      switch (type) {
        case 'sign-in': {
          signInWithOTPMutation.mutate(
            {
              email,
              otp: data.otp,
            },
            {
              onSuccess: (result) => {
                form.reset();
                onSuccess?.(result);
              },
              onError: (error) => {
                toast.error('Verification failed', {
                  description:
                    error.message ?? 'Invalid code. Please try again.',
                });
                form.setFocus('otp');
              },
            },
          );
          break;
        }
        case 'email-verification': {
          verifyEmailWithOTPMutation.mutate(
            {
              email,
              otp: data.otp,
            },
            {
              onSuccess: (result) => {
                form.reset();
                onSuccess?.(result);
              },
              onError: (error) => {
                toast.error('Verification failed', {
                  description:
                    error.message ?? 'Invalid code. Please try again.',
                });
                form.setFocus('otp');
              },
            },
          );
          break;
        }
        case 'forget-password': {
          // For forget-password, we still need to use direct authClient call
          // since we don't have a dedicated hook for this specific verification
          const verifyForgetPasswordOTP = async () => {
            try {
              const result = await authClient.emailOtp.checkVerificationOtp({
                email,
                otp: data.otp,
                type: 'forget-password',
              });

              if (result.error) {
                toast.error('Verification failed', {
                  description:
                    result.error.message ?? 'Invalid code. Please try again.',
                });
                form.setFocus('otp');
                return;
              }

              form.reset();
              onSuccess?.(result.data);
            } catch (error) {
              authLogger.error({ err: error }, 'OTP verification error');
              toast.error('Verification failed', {
                description: 'An unexpected error occurred. Please try again.',
              });
              form.setFocus('otp');
            }
          };

          verifyForgetPasswordOTP();
          break;
        }
        default: {
          toast.error('Verification failed', {
            description: 'Invalid OTP type.',
          });
        }
      }
    },
    [
      email,
      type,
      form,
      onSuccess,
      signInWithOTPMutation,
      verifyEmailWithOTPMutation,
    ],
  );

  // Auto-submit when OTP is complete and valid
  const handleAutoSubmit = useCallback(
    (otpValue: string) => {
      const isLoading =
        signInWithOTPMutation.isPending || verifyEmailWithOTPMutation.isPending;

      if (otpValue.length === 6 && !isLoading) {
        // Small delay to ensure user sees the complete input
        const timeoutId = setTimeout(() => {
          form.handleSubmit(onSubmit)();
        }, 150);

        return () => clearTimeout(timeoutId);
      }
    },
    [
      form,
      onSubmit,
      signInWithOTPMutation.isPending,
      verifyEmailWithOTPMutation.isPending,
    ],
  );

  // Watch for OTP changes and trigger auto-submit
  const watchedOTP = form.watch('otp');
  useEffect(() => {
    if (watchedOTP) {
      handleAutoSubmit(watchedOTP);
    }
  }, [watchedOTP, handleAutoSubmit]);

  const startCountdown = useCallback(() => {
    setCanResend(false);
    setCountdown(60); // 60 seconds countdown

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleResend = async () => {
    if (onResend) {
      onResend();
      startCountdown();
    } else {
      // If no custom resend handler, use the default
      setIsResending(true);
      try {
        const result = await authClient.emailOtp.sendVerificationOtp({
          email,
          type,
        });

        if (result.error) {
          toast.error('Failed to resend code', {
            description: result.error.message ?? 'Please try again later.',
          });
        } else {
          toast.success('Code sent!', {
            description: 'A new verification code has been sent to your email.',
          });
          startCountdown();
        }
      } catch (error) {
        authLogger.error({ err: error }, 'Resend OTP error');
        toast.error('Failed to resend code', {
          description: 'An unexpected error occurred. Please try again.',
        });
      } finally {
        setIsResending(false);
      }
    }
  };

  // Form content that's shared between card and inline variants
  const formContent = (
    <div className="space-y-4">
      <p className="text-muted-foreground text-center text-sm">
        {description ?? getDefaultDescription(type, email)}
      </p>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">One-Time Password</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      {...field}
                      disabled={
                        signInWithOTPMutation.isPending ||
                        verifyEmailWithOTPMutation.isPending
                      }
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-full"
            disabled={!form.watch('otp') || form.watch('otp').length !== 6}
            loading={
              signInWithOTPMutation.isPending ||
              verifyEmailWithOTPMutation.isPending
            }
            loadingText="Verifying..."
            type="submit"
          >
            <Icons.check className="mr-2 size-4" />
            Verify Code
          </Button>
        </form>
      </Form>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Didn&apos;t receive the code?{' '}
          <button
            className="text-primary font-medium underline-offset-4 hover:underline disabled:opacity-50"
            disabled={isResending || !canResend}
            type="button"
            onClick={handleResend}
          >
            {isResending
              ? 'Sending...'
              : canResend
                ? 'Resend code'
                : `Resend in ${countdown}s`}
          </button>
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Code expires in 5 minutes
        </p>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          {title ?? getDefaultTitle(type)}
        </CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
