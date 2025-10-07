import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp/input-otp';

const meta: Meta<typeof InputOTP> = {
  component: InputOTP,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A one-time password input component built on top of input-otp library. Provides accessible OTP input with keyboard navigation and paste support.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Input OTP',
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  args: {},
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const WithSeparator: Story = {
  args: {},
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const FourDigit: Story = {
  args: {},
  render: () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enter Verification Code</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          We&apos;ve sent a 4-digit code to your phone
        </p>
      </div>
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center">
        <Button size="sm" variant="link">
          Didn&apos;t receive the code? Resend
        </Button>
      </div>
    </div>
  ),
};

export const AuthenticationFlow: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState('');
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [isVerified, setIsVerified] = React.useState(false);

    const handleComplete = async () => {
      setIsVerifying(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsVerified(true);
      setIsVerifying(false);
    };

    if (isVerified) {
      return (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Icons.checkCircle className="text-green-600" size="xl" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Verified!</h3>
            <p className="mt-1 text-sm text-green-700">
              Your phone number has been verified successfully.
            </p>
          </div>
          <Button>Continue</Button>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-sm space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="space-y-4">
          <InputOTP
            disabled={isVerifying}
            maxLength={6}
            value={value}
            onChange={setValue}
            onComplete={handleComplete}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {isVerifying && (
            <div className="text-muted-foreground flex items-center justify-center space-x-2 text-sm">
              <Icons.spinner className="animate-spin" />
              <span>Verifying code...</span>
            </div>
          )}

          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">
              Code expires in 4:32
            </p>
            <Button disabled={isVerifying} size="sm" variant="link">
              Generate new code
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground text-center text-xs">
          Having trouble? Contact{' '}
          <Button className="h-auto p-0 text-xs" size="sm" variant="link">
            support
          </Button>
        </div>
      </div>
    );
  },
};

export const LoginVerification: Story = {
  args: {},
  render: () => {
    const [step, setStep] = React.useState<'phone' | 'code' | 'success'>(
      'phone',
    );
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [otpValue, setOtpValue] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [isVerifying, setIsVerifying] = React.useState(false);

    const sendCode = async () => {
      setIsSending(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSending(false);
      setStep('code');
    };

    const verifyCode = async () => {
      setIsVerifying(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsVerifying(false);
      setStep('success');
    };

    if (step === 'success') {
      return (
        <div className="mx-auto max-w-sm space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Icons.checkCircle className="text-green-600" size="2xl" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Welcome back!</h3>
            <p className="text-muted-foreground mt-2">
              You have been successfully logged in.
            </p>
          </div>
          <Button className="w-full">Continue to Dashboard</Button>
        </div>
      );
    }

    if (step === 'code') {
      return (
        <div className="mx-auto max-w-sm space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Verify your number</h3>
            <p className="text-muted-foreground mt-2">
              Enter the 4-digit code sent to
            </p>
            <p className="font-medium">{phoneNumber}</p>
          </div>

          <div className="space-y-4">
            <InputOTP
              disabled={isVerifying}
              maxLength={4}
              value={otpValue}
              onChange={setOtpValue}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              className="w-full"
              disabled={otpValue.length !== 4 || isVerifying}
              onClick={verifyCode}
            >
              {isVerifying ? (
                <>
                  <Icons.spinner className="mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-muted-foreground text-sm">
              Didn&apos;t receive the code?
            </p>
            <div className="space-x-4">
              <Button size="sm" variant="link">
                Resend SMS
              </Button>
              <Button size="sm" variant="link" onClick={() => setStep('phone')}>
                Change number
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-sm space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold">Sign in to your account</h3>
          <p className="text-muted-foreground mt-2">
            We&apos;ll send a verification code to your phone
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="phone-number"
            >
              Phone Number
            </label>
            <div className="flex">
              <div className="bg-muted flex items-center rounded-l-md border border-r-0 px-3 text-sm">
                +1
              </div>
              <input
                className="focus:ring-primary flex-1 rounded-r-md border px-3 py-2 outline-none focus:border-transparent focus:ring-2"
                id="phone-number"
                placeholder="(555) 123-4567"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!phoneNumber || isSending}
            onClick={sendCode}
          >
            {isSending ? (
              <>
                <Icons.spinner className="mr-2 animate-spin" />
                Sending code...
              </>
            ) : (
              'Send verification code'
            )}
          </Button>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          By continuing, you agree to our{' '}
          <Button className="h-auto p-0 text-sm" variant="link">
            Terms of Service
          </Button>{' '}
          and{' '}
          <Button className="h-auto p-0 text-sm" variant="link">
            Privacy Policy
          </Button>
        </div>
      </div>
    );
  },
};

export const WithValidation: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const validateAndSubmit = async (code: string) => {
      setError('');
      setIsSubmitting(true);

      // Simulate validation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (code === '123456') {
        // Success case
        setIsSubmitting(false);
      } else {
        // Error case
        setError('Invalid code. Please try again.');
        setValue('');
        setIsSubmitting(false);
      }
    };

    return (
      <div className="mx-auto max-w-sm space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Enter Security Code</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            For testing: use code &quot;123456&quot; for success
          </p>
        </div>

        <div className="space-y-2">
          <InputOTP
            aria-describedby={error ? 'otp-error' : undefined}
            aria-invalid={!!error}
            disabled={isSubmitting}
            maxLength={6}
            value={value}
            onChange={setValue}
            onComplete={validateAndSubmit}
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

          {error && (
            <div
              className="flex items-center space-x-2 text-sm text-red-600"
              id="otp-error"
            >
              <Icons.xCircle />
              <span>{error}</span>
            </div>
          )}

          {isSubmitting && (
            <div className="text-muted-foreground flex items-center justify-center space-x-2 text-sm">
              <Icons.spinner className="animate-spin" />
              <span>Validating...</span>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button
            size="sm"
            variant="link"
            onClick={() => {
              setError('');
              setValue('');
            }}
          >
            Clear and try again
          </Button>
        </div>
      </div>
    );
  },
};

export const BackupCodes: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState('');
    const [showBackup, setShowBackup] = React.useState(false);
    const [backupCode, setBackupCode] = React.useState('');

    if (showBackup) {
      return (
        <div className="mx-auto max-w-sm space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Use backup code</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter one of your 8-digit backup codes
            </p>
          </div>

          <div className="space-y-4">
            <InputOTP maxLength={8} value={backupCode} onChange={setBackupCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>

            <Button className="w-full" disabled={backupCode.length !== 8}>
              Verify backup code
            </Button>
          </div>

          <div className="text-center">
            <Button
              size="sm"
              variant="link"
              onClick={() => setShowBackup(false)}
            >
              ← Back to authenticator code
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-sm space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Two-step verification</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the code from your authenticator app
          </p>
        </div>

        <div className="space-y-4">
          <InputOTP maxLength={6} value={value} onChange={setValue}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button className="w-full" disabled={value.length !== 6}>
            Continue
          </Button>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-muted-foreground text-sm">
            Can&apos;t access your authenticator?
          </p>
          <Button size="sm" variant="link" onClick={() => setShowBackup(true)}>
            Use backup code instead
          </Button>
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  args: {
    onChange: fn(),
    onComplete: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify initial state - text is split across elements
    expect(canvas.getByText('(empty)')).toBeVisible();
    expect(canvas.getByText('Length: 0/6')).toBeVisible();
    expect(canvas.getByText('Complete: No')).toBeVisible();
    expect(canvas.getByText('Completion attempts: 0')).toBeVisible();

    // Find the OTP input container - the actual input is hidden, so we interact with the container
    const otpContainer = canvasElement.querySelector('[data-slot="input-otp"]');
    if (!otpContainer) {
      throw new TypeError('Expected to find OTP container');
    }

    // Click on container to focus it
    await userEvent.click(otpContainer);

    // Type individual digits
    await userEvent.type(otpContainer, '1');

    await waitFor(() => {
      // Check for the digit in the slot by finding it directly in slot container
      const firstOtpSlot = canvasElement.querySelector(
        '[data-slot="input-otp-slot"]',
      );
      if (!firstOtpSlot) {
        throw new TypeError('Expected to find first OTP slot');
      }
      expect(firstOtpSlot.textContent).toBe('1');
      expect(canvas.getByText('Length: 1/6')).toBeVisible();
    });

    // Verify onChange was called
    expect(args.onChange).toHaveBeenCalledWith('1');

    // Continue typing
    await userEvent.type(otpContainer, '23456');

    await waitFor(() => {
      // Check for the complete value in the status area to avoid multiple matches
      const statusValue = canvas.getByText('123456', {
        selector: '.font-mono',
      });
      expect(statusValue).toBeVisible();
      expect(canvas.getByText('Length: 6/6')).toBeVisible();
      expect(canvas.getByText('Complete: Yes')).toBeVisible();
      expect(canvas.getByText('Completion attempts: 1')).toBeVisible();
    });

    // Verify onComplete was called
    expect(args.onComplete).toHaveBeenCalledWith('123456');

    // Test reset functionality
    const resetButton = canvas.getByRole('button', { name: 'Reset' });
    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(canvas.getByText('(empty)')).toBeVisible();
      expect(canvas.getByText('Length: 0/6')).toBeVisible();
      expect(canvas.getByText('Complete: No')).toBeVisible();
    });

    // Test fill example button
    const fillButton = canvas.getByRole('button', { name: 'Fill Example' });
    await userEvent.click(fillButton);

    await waitFor(() => {
      const statusValue = canvas.getByText('123456', {
        selector: '.font-mono',
      });
      expect(statusValue).toBeVisible();
      expect(canvas.getByText('Length: 6/6')).toBeVisible();
      expect(canvas.getByText('Complete: Yes')).toBeVisible();
      expect(canvas.getByText('Completion attempts: 2')).toBeVisible();
    });

    // Verify callbacks were called again
    expect(args.onChange).toHaveBeenCalledWith('123456');
    expect(args.onComplete).toHaveBeenCalledWith('123456');
  },
  render: (args) => {
    const [value, setValue] = React.useState('');
    const [isComplete, setIsComplete] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);

    const handleChange = (newValue: string) => {
      setValue(newValue);
      setIsComplete(false);
      args.onChange?.(newValue);
    };

    const handleComplete = (code: string) => {
      setIsComplete(true);
      setAttempts((prev) => prev + 1);
      args.onComplete?.(code);
    };

    const reset = () => {
      setValue('');
      setIsComplete(false);
    };

    return (
      <div className="mx-auto max-w-sm space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Interactive OTP Test</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Type or paste a 6-digit code to test the component
          </p>
        </div>

        <div className="space-y-4">
          <InputOTP
            maxLength={6}
            value={value}
            onChange={handleChange}
            onComplete={handleComplete}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <div className="space-y-1 text-sm">
            <p>
              Current value:{' '}
              <span className="font-mono">{value || '(empty)'}</span>
            </p>
            <p>Length: {value.length}/6</p>
            <p>Complete: {isComplete ? 'Yes' : 'No'}</p>
            <p>Completion attempts: {attempts}</p>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" variant="outlined" onClick={reset}>
              Reset
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setValue('123456')}
            >
              Fill Example
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>• Type individual digits to fill the code</p>
          <p>• Try pasting &quot;123456&quot; to test paste functionality</p>
          <p>• Use backspace to delete digits</p>
          <p>• Arrow keys navigate between slots</p>
        </div>
      </div>
    );
  },
};
