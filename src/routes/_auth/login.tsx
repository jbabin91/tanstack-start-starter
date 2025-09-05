import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';

import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/modules/auth/components/login-form';
import { LoginOTPForm } from '@/modules/auth/components/login-otp-form';

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Sign In - TanStack Start Starter',
        name: 'title',
      },
      {
        name: 'description',
        content:
          'Sign in to your account to access your dashboard and personalized content.',
      },
    ],
  }),
});

function RouteComponent() {
  const search = useSearch({ from: '/_auth' });
  const navigate = useNavigate();

  const onLoginSuccess = () => {
    // Hook already handles data/auth state refresh
    // Component handles navigation/UI
    navigate({
      to: search.redirectUrl ?? '/dashboard',
      replace: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <p className="text-muted-foreground text-sm">
            Choose your preferred sign-in method
          </p>
        </CardHeader>
        <CardContent>
          <Tabs className="w-full" defaultValue="password">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger className="flex items-center gap-2" value="password">
                <Icons.shield className="size-4" />
                Password
              </TabsTrigger>
              <TabsTrigger className="flex items-center gap-2" value="otp">
                <Icons.mail className="size-4" />
                Email Code
              </TabsTrigger>
            </TabsList>

            <TabsContent
              className="data-[state=active]:animate-in data-[state=active]:fade-in-0 mt-0 transition-opacity duration-200"
              value="password"
            >
              <LoginForm
                className="border-0 p-0 shadow-none"
                onSuccess={onLoginSuccess}
              />
            </TabsContent>

            <TabsContent
              className="data-[state=active]:animate-in data-[state=active]:fade-in-0 mt-0 transition-opacity duration-200"
              value="otp"
            >
              <LoginOTPForm
                className="border-0 p-0 shadow-none"
                onSuccess={onLoginSuccess}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-3 text-center text-sm">
        <div className="text-muted-foreground flex items-center justify-center space-x-1">
          <span>Don&apos;t have an account?</span>
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to="/register"
          >
            Sign up
          </Link>
        </div>

        <div>
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to="/forgot-password"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
