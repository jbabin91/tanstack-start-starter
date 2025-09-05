import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type } from 'arktype';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import { OTPVerificationForm } from '@/modules/auth/components/otp-verification-form';
import { useAuthStateHelpers } from '@/modules/auth/hooks/use-auth-state-helpers';

type VerificationState = 'loading' | 'success' | 'error' | 'no-token' | 'otp';

const searchSchema = type({
  token: 'string?',
  email: 'string?',
  method: "'email-link' | 'verification-code'?",
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
  const { refreshAuthState } = useAuthStateHelpers();
  const { token, email, method } = Route.useSearch();

  const [verificationState, setVerificationState] =
    useState<VerificationState>('loading');
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle email verification on mount with auto-detection
  useEffect(() => {
    const initializeVerification = async () => {
      // If user explicitly chose verification-code and no token, go directly to OTP
      if (method === 'verification-code' && !token) {
        setVerificationState('otp');
        return;
      }

      // If no token at all (regardless of method), show no-token state
      if (!token) {
        setVerificationState('no-token');
        return;
      }

      // If we have a token, attempt email link verification (standard flow)
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
            // Hook handles data/auth state and navigation/UI
            refreshAuthState().finally(() => {
              navigate({ to: '/dashboard', replace: true });
            });
          }, 2000);

          return () => {
            clearTimeout(timeoutId);
          };
        }
      } catch (error) {
        authLogger.error({ err: error }, 'Email verification error');
        setErrorMessage('An unexpected error occurred during verification.');
        setVerificationState('error');
      }
    };

    initializeVerification();
  }, [token, method, navigate]);

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
      authLogger.error({ err: error }, 'Resend verification error');
      toast.error('Failed to resend verification email', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Email address not found', {
        description: 'Please try signing up again.',
      });
      return;
    }

    setIsResending(true);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      });

      if (result.error) {
        toast.error('Failed to send verification code', {
          description: result.error.message ?? 'Please try again later.',
        });
      } else {
        toast.success('Verification code sent!', {
          description: 'Please check your email for the verification code.',
        });
        setVerificationState('otp');
      }
    } catch (error) {
      authLogger.error({ err: error }, 'Send OTP error');
      toast.error('Failed to send verification code', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPSuccess = () => {
    setVerificationState('success');
    toast.success('Email verified successfully!', {
      description: 'You have been automatically signed in.',
    });

    // Small delay before redirect to show success message
    setTimeout(() => {
      // Hook handles data/auth state and navigation/UI
      refreshAuthState().finally(() => {
        navigate({ to: '/dashboard', replace: true });
      });
    }, 2000);
  };

  const handleBackToNoToken = () => {
    setVerificationState('no-token');
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
                <CheckCircleIcon className="text-success size-6" />
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
                <XCircleIcon className="text-error size-6" />
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
                Didn&apos;t receive the email? Check your spam folder or try one
                of the options below.
              </p>
              {email && (
                <div className="space-y-3">
                  <Button
                    disabled={isResending}
                    loading={isResending}
                    loadingText="Sending..."
                    variant="outlined"
                    onClick={handleResendVerification}
                  >
                    Resend verification email
                  </Button>
                  <div className="text-muted-foreground text-sm">or</div>
                  <Button
                    disabled={isResending}
                    loading={isResending}
                    loadingText="Sending..."
                    variant="outlined"
                    onClick={handleSendOTP}
                  >
                    Get verification code instead
                  </Button>
                </div>
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

      case 'otp': {
        if (!email) {
          setVerificationState('no-token');
          return null;
        }

        return (
          <div className="space-y-4">
            <OTPVerificationForm
              email={email}
              type="email-verification"
              onSuccess={handleOTPSuccess}
            />
            <div className="text-center">
              <button
                className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                type="button"
                onClick={handleBackToNoToken}
              >
                ← Use email link instead
              </button>
            </div>
          </div>
        );
      }

      default: {
        return null;
      }
    }
  }

  return renderContent();
}
