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
import { Checkbox } from '~/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { SocialAuthButton } from '~/features/auth/components/social-auth-button';
import { authClient } from '~/lib/client/auth-client';

const REDIRECT_URL = '/dashboard';

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
  rememberMe: z.boolean().default(false),
});

type SigninForm = z.infer<typeof signinSchema>;

export const Route = createFileRoute('/_auth/signin')({
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

  const form = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: SigninForm) {
    try {
      setError(null);
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: REDIRECT_URL,
        rememberMe: data.rememberMe,
      });
    } catch {
      setError('Invalid email or password. Please try again.');
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
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in with your email or social account
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
                              autoComplete="email"
                              autoFocus
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
                                autoComplete="current-password"
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Remember me
                          </FormLabel>
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
                          Signing in...
                        </>
                      ) : (
                        'Sign in'
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
                    mode="signin"
                    className="bg-[#5865F2] hover:bg-[#5865F2]/80"
                  />
                  <SocialAuthButton
                    provider="github"
                    label="GitHub"
                    mode="signin"
                    className="bg-neutral-700 hover:bg-neutral-700/80"
                  />
                  <SocialAuthButton
                    provider="google"
                    label="Google"
                    mode="signin"
                    className="bg-[#DB4437] hover:bg-[#DB4437]/80"
                  />
                </div>
                <div className="text-center text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
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
