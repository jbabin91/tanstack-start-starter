import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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
import { useSendSignInOTP } from '@/modules/auth/hooks/use-send-sign-in-otp';
import { useSignInWithOTP } from '@/modules/auth/hooks/use-sign-in-with-otp';

export const otpVerificationFormSchema = type({
  otp: 'string>=6',
});

type OTPVerificationFormData = typeof otpVerificationFormSchema.infer;

type OTPVerificationFormProps = {
  email: string;
  onSuccess?: (data?: unknown) => void;
  onResend?: () => void;
  className?: string;
  title?: string;
  description?: string;
  variant?: 'card' | 'inline';
};

function getDefaultTitle(): string {
  return 'Enter your sign-in code';
}

function getDefaultDescription(email: string): string {
  return `We've sent a sign-in code to ${email}. Enter the code below to continue.`;
}

/**
 * OTPVerificationForm component provides OTP verification functionality for sign-in.
 */
export function OTPVerificationForm({
  email,
  onSuccess,
  onResend,
  className,
  title,
  description,
  variant = 'card',
}: OTPVerificationFormProps) {
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const signInWithOTPMutation = useSignInWithOTP();
  const sendOTPMutation = useSendSignInOTP();

  const form = useForm<OTPVerificationFormData>({
    defaultValues: {
      otp: '',
    },
    resolver: arktypeResolver(otpVerificationFormSchema),
  });

  const onSubmit = useCallback(
    (data: OTPVerificationFormData) => {
      // Only sign-in type is supported
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
              description: error.message ?? 'Invalid code. Please try again.',
            });
            form.setFocus('otp');
          },
        },
      );
    },
    [email, form, onSuccess, signInWithOTPMutation],
  );

  // Auto-submit when OTP is complete and valid
  const handleAutoSubmit = useCallback(
    (otpValue: string) => {
      const isLoading = signInWithOTPMutation.isPending;

      if (otpValue.length === 6 && !isLoading) {
        // Small delay to ensure user sees the complete input
        const timeoutId = setTimeout(() => {
          form.handleSubmit(onSubmit)();
        }, 150);

        return () => clearTimeout(timeoutId);
      }
    },
    [form, onSubmit, signInWithOTPMutation.isPending],
  );

  // Watch for OTP changes and trigger auto-submit
  const otpValue = useWatch({
    control: form.control,
    name: 'otp',
  });

  useEffect(() => {
    if (otpValue) {
      handleAutoSubmit(otpValue);
    }
  }, [otpValue, handleAutoSubmit]);

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

  const handleResend = () => {
    if (onResend) {
      onResend();
      startCountdown();
    } else {
      // Use the hook for sending OTP
      sendOTPMutation.mutate(
        {
          email,
          type: 'sign-in',
        },
        {
          onSuccess: () => {
            toast.success('Code sent!', {
              description:
                'A new verification code has been sent to your email.',
            });
            startCountdown();
          },
          onError: (error) => {
            toast.error('Failed to resend code', {
              description: error.message ?? 'Please try again later.',
            });
          },
        },
      );
    }
  };

  // Form content that's shared between card and inline variants
  const formContent = (
    <div className="space-y-4">
      <p className="text-muted-foreground text-center text-sm">
        {description ?? getDefaultDescription(email)}
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
                      disabled={signInWithOTPMutation.isPending}
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
            disabled={!otpValue || otpValue.length !== 6}
            loading={signInWithOTPMutation.isPending}
            loadingText="Verifying..."
            type="submit"
          >
            <Icons.check className="mr-2" />
            Verify Code
          </Button>
        </form>
      </Form>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Didn&apos;t receive the code?{' '}
          <button
            className="text-primary font-medium underline-offset-4 hover:underline disabled:opacity-50"
            disabled={sendOTPMutation.isPending || !canResend}
            type="button"
            onClick={handleResend}
          >
            {sendOTPMutation.isPending
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
          {title ?? getDefaultTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
