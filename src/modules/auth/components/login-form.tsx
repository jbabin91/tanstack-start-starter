'use client';

import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { authClient } from '@/lib/auth/client';

export const loginFormSchema = type({
  email: 'string.email>=1',
  password: 'string>=6',
  rememberMe: 'boolean',
});

type LoginFormData = typeof loginFormSchema.infer;

type LoginFormProps = {
  onSuccess?: () => void;
  className?: string;
};

/**
 * LoginForm component provides email/password authentication with remember me option.
 * Features include password visibility toggle, form validation, loading states,
 * and integration with better-auth for secure authentication.
 */
export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    resolver: arktypeResolver(loginFormSchema),
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (result.error) {
        toast.error('Login failed', {
          description:
            result.error.message ??
            'Please check your credentials and try again.',
        });
        return;
      }

      toast.success('Welcome back!', {
        description: 'You have been successfully logged in.',
      });

      // Reset form on successful login
      form.reset();

      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
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
          Welcome back
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
                      aria-describedby="email-error"
                      autoComplete="email"
                      disabled={isLoading}
                      placeholder="name@example.com"
                      type="email"
                    />
                  </FormControl>
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
                        aria-describedby="password-error"
                        autoComplete="current-password"
                        className="pr-10"
                        disabled={isLoading}
                        placeholder="Enter your password"
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
                          <EyeOffIcon className="text-muted-foreground h-4 w-4" />
                        ) : (
                          <EyeIcon className="text-muted-foreground h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage id="password-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      aria-describedby="remember-me-description"
                      checked={field.value}
                      disabled={isLoading}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer text-sm font-normal">
                      Remember me for 30 days
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
              loadingText="Signing in..."
              type="submit"
            >
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
