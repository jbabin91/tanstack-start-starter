import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import { useSignIn } from '@/modules/auth/hooks/use-sign-in';

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

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const signInMutation = useSignIn();

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

  const onSubmit = (data: LoginFormData) => {
    signInMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Welcome back!', {
          description: 'You have been successfully logged in.',
        });
        // Reset form on successful login
        form.reset();
        // Call success callback if provided
        onSuccess?.();
      },
      onError: (error) => {
        toast.error('Login failed', {
          description:
            error.message ?? 'Please check your credentials and try again.',
        });
      },
    });
  };

  return (
    <div className={className}>
      <div className="space-y-4">
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
                      disabled={signInMutation.isPending}
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
                        disabled={signInMutation.isPending}
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                      />
                      <Button
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        disabled={signInMutation.isPending}
                        size="icon"
                        tabIndex={-1}
                        type="button"
                        variant="ghost"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <Icons.eyeOff className="text-muted-foreground size-4" />
                        ) : (
                          <Icons.eye className="text-muted-foreground size-4" />
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
                <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      aria-describedby="remember-me-description"
                      checked={field.value}
                      disabled={signInMutation.isPending}
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
              disabled={signInMutation.isPending}
              loading={signInMutation.isPending}
              loadingText="Signing in..."
              type="submit"
            >
              Sign in with password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
