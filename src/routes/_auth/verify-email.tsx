import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type } from 'arktype';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useSendEmailVerificationLink } from '@/modules/auth/hooks/use-send-email-verification-link';
import { useVerifyEmailWithToken } from '@/modules/auth/hooks/use-verify-email-with-token';

type VerificationState = 'loading' | 'success' | 'error' | 'no-token';

const searchSchema = type({
  token: 'string?',
  email: 'string?',
});

export const Route = createFileRoute('/_auth/verify-email')({
  component: RouteComponent,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      {
        name: 'title',
        title: 'Verify Email - TanStack Start Starter',
      },
      {
        name: 'description',
        content:
          'Verify your email address to complete your account setup and gain access to all features.',
      },
    ],
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();

  const [verificationState, setVerificationState] =
    useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyEmailMutation = useVerifyEmailWithToken();
  const resendVerificationMutation = useSendEmailVerificationLink();

  // Handle email verification on mount
  useEffect(() => {
    const initializeVerification = async () => {
      // If no token, show no-token state
      if (!token) {
        setVerificationState('no-token');
        return;
      }

      // Attempt email link verification
      try {
        setVerificationState('loading');

        await verifyEmailMutation.mutateAsync({
          query: { token },
        });

        setVerificationState('success');
        toast.success('Email verified successfully!', {
          description: 'You have been automatically signed in.',
        });

        // Small delay before redirect to show success message
        const timeoutId = setTimeout(() => {
          // Hook handles data/auth state refresh automatically
          navigate({ to: '/dashboard', replace: true });
        }, 2000);

        return () => {
          clearTimeout(timeoutId);
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred during verification.';
        setErrorMessage(message);
        setVerificationState('error');
      }
    };

    initializeVerification();
  }, [token, navigate, verifyEmailMutation]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found', {
        description:
          'Please try signing up again to receive a new verification email.',
      });
      return;
    }

    try {
      await resendVerificationMutation.mutateAsync({
        email,
        callbackURL: '/verify-email',
      });

      toast.success('Verification email sent!', {
        description: 'Please check your email for the new verification link.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';
      toast.error('Failed to resend verification email', {
        description: message,
      });
    }
  };

  function renderContent() {
    switch (verificationState) {
      case 'loading': {
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Verifying your email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </CardContent>
          </Card>
        );
      }

      case 'success': {
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Icons.checkCircle className="text-success" size="xl" />
                Email verified successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Your email has been verified and you have been automatically
                signed in. You will be redirected to your dashboard shortly.
              </p>
              <Button onClick={() => navigate({ to: '/dashboard' })}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        );
      }

      case 'error': {
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Icons.xCircle className="text-error" size="xl" />
                Verification failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">{errorMessage}</p>
              {email && (
                <Button
                  disabled={resendVerificationMutation.isPending}
                  loading={resendVerificationMutation.isPending}
                  loadingText="Sending..."
                  variant="outlined"
                  onClick={handleResendVerification}
                >
                  Resend verification email
                </Button>
              )}
              <div className="text-sm">
                <Link
                  className="text-primary font-medium underline-offset-4 hover:underline"
                  to="/login"
                >
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      }

      case 'no-token': {
        return (
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                We&apos;ve sent you a verification email
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Please check your inbox and click the verification link to
                complete your account setup.
              </p>
              <p className="text-muted-foreground text-sm">
                Didn&apos;t receive the email? Check your spam folder or try
                resending the verification email.
              </p>
              {email && (
                <Button
                  disabled={resendVerificationMutation.isPending}
                  loading={resendVerificationMutation.isPending}
                  loadingText="Sending..."
                  variant="outlined"
                  onClick={handleResendVerification}
                >
                  Resend verification email
                </Button>
              )}
              <div className="pt-2 text-sm">
                <Link
                  className="text-primary font-medium underline-offset-4 hover:underline"
                  to="/login"
                >
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      }

      default: {
        return null;
      }
    }
  }

  return renderContent();
}
