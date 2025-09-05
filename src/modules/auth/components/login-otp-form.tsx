import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import { useSendEmailVerificationOTP } from '@/modules/auth/hooks/use-send-email-verification-otp';

import { OTPVerificationForm } from './otp-verification-form';

export const loginOTPFormSchema = type({
  email: 'string.email>=1',
});

type LoginOTPFormData = typeof loginOTPFormSchema.infer;

type LoginOTPFormProps = {
  onSuccess?: () => void;
  className?: string;
};

type LoginOTPStep = 'email' | 'otp';

export function LoginOTPForm({ onSuccess, className }: LoginOTPFormProps) {
  const [step, setStep] = useState<LoginOTPStep>('email');
  const [email, setEmail] = useState('');

  const sendOTPMutation = useSendEmailVerificationOTP();

  const form = useForm<LoginOTPFormData>({
    defaultValues: {
      email: '',
    },
    resolver: arktypeResolver(loginOTPFormSchema),
  });

  const onSubmitEmail = (data: LoginOTPFormData) => {
    sendOTPMutation.mutate(
      {
        email: data.email,
        type: 'sign-in',
      },
      {
        onSuccess: () => {
          toast.success('Code sent!', {
            description: 'Check your email for the sign-in code.',
          });
          setEmail(data.email);
          setStep('otp');
        },
        onError: (error) => {
          toast.error('Failed to send code', {
            description:
              error.message ?? 'Please check your email and try again.',
          });
        },
      },
    );
  };

  const handleOTPSuccess = () => {
    toast.success('Welcome back!', {
      description: 'You have been successfully signed in.',
    });
    // Reset form state
    form.reset();
    setStep('email');
    setEmail('');
    // Call success callback if provided
    onSuccess?.();
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
  };

  const handleResendOTP = () => {
    sendOTPMutation.mutate(
      {
        email,
        type: 'sign-in',
      },
      {
        onSuccess: () => {
          toast.success('Code sent!', {
            description: 'A new sign-in code has been sent to your email.',
          });
        },
        onError: (error) => {
          toast.error('Failed to resend code', {
            description: error.message ?? 'Please try again later.',
          });
        },
      },
    );
  };

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <OTPVerificationForm
          className={className}
          email={email}
          type="sign-in"
          variant="inline"
          onResend={handleResendOTP}
          onSuccess={handleOTPSuccess}
        />
        <div className="text-center">
          <button
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            type="button"
            onClick={handleBackToEmail}
          >
            <Icons.chevronLeft className="mr-1 inline size-3" />
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmitEmail)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="email"
                      disabled={sendOTPMutation.isPending}
                      placeholder="name@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              disabled={!form.watch('email') || sendOTPMutation.isPending}
              loading={sendOTPMutation.isPending}
              loadingText="Sending code..."
              type="submit"
            >
              <Icons.mail className="mr-2 size-4" />
              Send sign-in code
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
