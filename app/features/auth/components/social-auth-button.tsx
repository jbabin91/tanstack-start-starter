import { Button } from '~/components/ui/button';
import { authClient } from '~/lib/client/auth-client';
import { cn } from '~/lib/utils';

type SocialAuthButtonProps = {
  provider: 'discord' | 'google' | 'github';
  label: string;
  mode: 'signin' | 'signup';
} & React.ComponentProps<typeof Button>;

export function SocialAuthButton({
  provider,
  label,
  mode,
  className,
  ...props
}: SocialAuthButtonProps) {
  return (
    <Button
      onClick={() =>
        authClient.signIn.social({
          callbackURL: '/dashboard',
          provider,
        })
      }
      variant="outline"
      size="lg"
      className={cn('text-white hover:text-white', className)}
      {...props}
    >
      {mode === 'signin' ? 'Sign in' : 'Sign up'} with {label}
    </Button>
  );
}
