import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { LuGalleryVerticalEnd } from 'react-icons/lu';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { authClient } from '~/lib/utils/auth-client';

const REDIRECT_URL = '/dashboard';

export const Route = createFileRoute('/_public/signin')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: REDIRECT_URL });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
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
              <CardDescription>Login with your Discord account</CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    <SignInButton
                      provider="discord"
                      label="Discord"
                      className="bg-[#5865F2] hover:bg-[#5865F2]/80"
                    />
                    <SignInButton
                      provider="github"
                      label="GitHub"
                      className="bg-neutral-700 hover:bg-neutral-700/80"
                    />
                    {/* <SignInButton
                      provider="google"
                      label="Google"
                      className="bg-[#DB4437] hover:bg-[#DB4437]/80"
                    /> */}
                  </div>
                  {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-background text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input id="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </div> */}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type SignInButtonProps = {
  provider: 'discord' | 'google' | 'github';
  label: string;
} & React.ComponentProps<typeof Button>;

function SignInButton({
  provider,
  label,
  className,
  ...props
}: SignInButtonProps) {
  return (
    <Button
      onClick={() =>
        authClient.signIn.social({
          callbackURL: REDIRECT_URL,
          provider,
        })
      }
      variant="outline"
      size="lg"
      className={cn('text-white hover:text-white', className)}
      {...props}
    >
      Sign in with {label}
    </Button>
  );
}
