'use client';

import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

export const registerFormSchema = type({
  acceptTerms: 'boolean',
  confirmPassword: 'string>=8',
  email: 'string.email>=1',
  name: 'string>=1',
  password: 'string>=8',
  username: '3<=string<=30',
});

type RegisterFormData = typeof registerFormSchema.infer;

type RegisterFormProps = {
  onSuccess?: () => void;
  className?: string;
};

/**
 * RegisterForm component provides user registration with email verification.
 * Features include username/email/password fields, password confirmation,
 * terms acceptance, and integration with better-auth for secure registration.
 */
export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      acceptTerms: false,
      confirmPassword: '',
      email: '',
      name: '',
      password: '',
      username: '',
    },
    resolver: arktypeResolver(registerFormSchema),
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const onSubmit = async (data: RegisterFormData) => {
    // Custom validation for password matching and terms acceptance
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        message: 'Passwords do not match',
        type: 'manual',
      });
      return;
    }

    if (!data.acceptTerms) {
      form.setError('acceptTerms', {
        message: 'You must accept the terms of service',
        type: 'manual',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        displayUsername: `@${data.username}`,
        email: data.email,
        name: data.name,
        password: data.password,
        username: data.username,
      });

      if (result.error) {
        toast.error('Registration failed', {
          description:
            result.error.message ??
            'Please check your information and try again.',
        });
        return;
      }

      toast.success('Account created successfully!', {
        description:
          'Please check your email to verify your account before signing in.',
      });

      // Reset form on successful registration
      form.reset();

      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Create an account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      aria-describedby="name-error name-description"
                      autoComplete="name"
                      disabled={isLoading}
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormDescription id="name-description">
                    Your full name or display name
                  </FormDescription>
                  <FormMessage id="name-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      aria-describedby="username-error username-description"
                      autoComplete="username"
                      disabled={isLoading}
                      placeholder="johndoe"
                    />
                  </FormControl>
                  <FormDescription id="username-description">
                    Choose a unique username (3-30 characters)
                  </FormDescription>
                  <FormMessage id="username-error" />
                </FormItem>
              )}
            />

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
                    We&apos;ll send you a verification email
                  </FormDescription>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        aria-describedby="password-error password-description"
                        autoComplete="new-password"
                        className="pr-10"
                        disabled={isLoading}
                        placeholder="Create a secure password"
                        type={showPassword ? 'text' : 'password'}
                      />
                      <Button
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        disabled={isLoading}
                        size="icon"
                        tabIndex={-1}
                        type="button"
                        variant="ghost"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <Icons.eyeOff className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <Icons.eye className="text-muted-foreground h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription id="password-description">
                    Must be at least 8 characters long
                  </FormDescription>
                  <FormMessage id="password-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        aria-describedby="confirm-password-error"
                        autoComplete="new-password"
                        className="pr-10"
                        disabled={isLoading}
                        placeholder="Confirm your password"
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <Button
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        disabled={isLoading}
                        size="icon"
                        tabIndex={-1}
                        type="button"
                        variant="ghost"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <Icons.eyeOff className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <Icons.eye className="text-muted-foreground h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage id="confirm-password-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      aria-describedby="terms-error"
                      checked={field.value}
                      disabled={isLoading}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer text-sm font-normal">
                      I accept the{' '}
                      <a
                        className="text-primary underline-offset-4 hover:underline"
                        href="/terms"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        className="text-primary underline-offset-4 hover:underline"
                        href="/privacy"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage id="terms-error" />
                  </div>
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
              loadingText="Creating account..."
              type="submit"
            >
              Create account
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
