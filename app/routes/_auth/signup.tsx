import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  LuEye,
  LuEyeOff,
  LuGalleryVerticalEnd,
  LuLoader,
} from 'react-icons/lu';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { PasswordStrength } from '~/features/auth/components/password-strength';
import { SocialAuthButton } from '~/features/auth/components/social-auth-button';
import { authClient } from '~/lib/client/auth-client';

const REDIRECT_URL = '/dashboard';

const signupSchema = z
  .object({
    name: z.string().min(1, 'Please enter your name'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export const Route = createFileRoute('/_auth/signup')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: REDIRECT_URL });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: SignupForm) {
    try {
      setError(null);
      await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: REDIRECT_URL,
      });
    } catch (error_) {
      if (
        error_ instanceof Error &&
        error_.message.toLowerCase().includes('existing email')
      ) {
        setError(
          'An account with this email already exists. Please sign in instead.',
        );
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
            <LuGalleryVerticalEnd className="size-4" />
          </div>
          TanStarter
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create an account</CardTitle>
              <CardDescription>
                Sign up with your email or social account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid gap-4"
                  >
                    {error && (
                      <div className="text-destructive text-center text-sm">
                        {error}
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John Doe"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="m@example.com"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
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
                                type={showPassword ? 'text' : 'password'}
                                disabled={isLoading}
                                autoComplete="new-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <LuEyeOff className="size-4" />
                                ) : (
                                  <LuEye className="size-4" />
                                )}
                                <span className="sr-only">
                                  {showPassword
                                    ? 'Hide password'
                                    : 'Show password'}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <PasswordStrength password={field.value} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showConfirmPassword ? 'text' : 'password'}
                                disabled={isLoading}
                                autoComplete="new-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                disabled={isLoading}
                              >
                                {showConfirmPassword ? (
                                  <LuEyeOff className="size-4" />
                                ) : (
                                  <LuEye className="size-4" />
                                )}
                                <span className="sr-only">
                                  {showConfirmPassword
                                    ? 'Hide password'
                                    : 'Show password'}
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LuLoader className="mr-2 size-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create account'
                      )}
                    </Button>
                  </form>
                </Form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <SocialAuthButton
                    provider="discord"
                    label="Discord"
                    mode="signup"
                    className="bg-[#5865F2] hover:bg-[#5865F2]/80"
                  />
                  <SocialAuthButton
                    provider="github"
                    label="GitHub"
                    mode="signup"
                    className="bg-neutral-700 hover:bg-neutral-700/80"
                  />
                  <SocialAuthButton
                    provider="google"
                    label="Google"
                    mode="signup"
                    className="bg-[#DB4437] hover:bg-[#DB4437]/80"
                  />
                </div>
                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/signin"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
