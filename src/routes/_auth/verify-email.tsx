import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type } from 'arktype';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth/client';

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
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle email verification on mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState('no-token');
        return;
      }

      try {
        setVerificationState('loading');

        const result = await authClient.verifyEmail({
          query: { token },
        });

        if (result.error) {
          setErrorMessage(
            result.error.message ??
              'Verification failed. The link may be expired or invalid.',
          );
          setVerificationState('error');
        } else {
          setVerificationState('success');
          toast.success('Email verified successfully!', {
            description: 'You have been automatically signed in.',
          });

          // Small delay before redirect to show success message
          const timeoutId = setTimeout(() => {
            navigate({ to: '/dashboard' });
          }, 2000);

          return () => {
            clearTimeout(timeoutId);
          };
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setErrorMessage('An unexpected error occurred during verification.');
        setVerificationState('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found', {
        description:
          'Please try signing up again to receive a new verification email.',
      });
      return;
    }

    setIsResending(true);

    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: '/verify-email',
      });

      if (result.error) {
        toast.error('Failed to resend verification email', {
          description: result.error.message ?? 'Please try again later.',
        });
      } else {
        toast.success('Verification email sent!', {
          description: 'Please check your email for the new verification link.',
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to resend verification email', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResending(false);
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
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
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
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
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
                <XCircleIcon className="h-6 w-6 text-red-600" />
                Verification failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">{errorMessage}</p>
              {email && (
                <Button
                  disabled={isResending}
                  loading={isResending}
                  loadingText="Sending..."
                  variant="outline"
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
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We&apos;ve sent you a verification email. Please check your
                inbox and click the verification link to complete your account
                setup.
              </p>
              <p className="text-muted-foreground text-sm">
                Didn&apos;t receive the email? Check your spam folder or click
                below to resend.
              </p>
              {email && (
                <Button
                  disabled={isResending}
                  loading={isResending}
                  loadingText="Sending..."
                  variant="outline"
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

      default: {
        return null;
      }
    }
  }

  return renderContent();
}
