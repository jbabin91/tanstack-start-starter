import { Button } from '~/components/ui/button';
import { authClient } from '~/lib/client/auth-client';
import { cn } from '~/lib/utils';

type SocialProvider = 'github' | 'discord' | 'google';

type SocialAuthButtonProps = {
  provider: SocialProvider;
  mode?: 'signin' | 'signup';
  className?: string;
};

export function SocialAuthButton({
  provider,
  mode = 'signin',
  className,
}: SocialAuthButtonProps) {
  const handleClick = async () => {
    await authClient.signIn.social({
      callbackURL: '/dashboard',
      provider,
    });
  };

  return (
    <Button
      className={cn('w-full', className)}
      variant="outline"
      onClick={handleClick}
    >
      {mode === 'signin' ? 'Sign in' : 'Sign up'} with{' '}
      {getProviderName(provider)}
    </Button>
  );
}

function getProviderName(provider: SocialProvider): string {
  switch (provider) {
    case 'github': {
      return 'GitHub';
    }
    case 'discord': {
      return 'Discord';
    }
    case 'google': {
      return 'Google';
    }
    default: {
      return provider;
    }
  }
}
