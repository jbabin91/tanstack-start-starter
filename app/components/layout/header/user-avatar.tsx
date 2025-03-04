import { useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { LuLogOut, LuMoon, LuSun, LuUser } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { userQuery, useUser } from '~/features/users/hooks/use-user';
import { authClient } from '~/lib/client/auth-client';
import { cn } from '~/lib/utils';

function getUserInitials(name: string | undefined) {
  if (!name) return '';

  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0][0]?.toUpperCase() ?? '';
  }
  return `${nameParts[0][0]?.toUpperCase() ?? ''}${
    nameParts.at(-1)?.[0]?.toUpperCase() ?? ''
  }`;
}

export function UserAvatar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const currentTheme = (resolvedTheme ?? theme ?? 'light') as 'light' | 'dark';

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <Button disabled className="relative size-8 rounded-full" variant="ghost">
        <Avatar className="size-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return (
      <>
        <Link
          activeProps={{
            className: 'font-bold',
          }}
          to="/signin"
        >
          Sign in
        </Link>
        <Link
          activeProps={{
            className: 'font-bold',
          }}
          to="/signup"
        >
          Sign up
        </Link>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative size-8 rounded-full" variant="ghost">
          <Avatar className="size-8">
            <AvatarImage alt={user.name} src={user.image ?? undefined} />
            <AvatarFallback
              className={cn(
                currentTheme === 'dark'
                  ? 'bg-blue-800 text-blue-200'
                  : 'bg-blue-200 text-blue-800',
              )}
            >
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link
            className="flex items-center"
            params={{
              userId: user.id,
            }}
            to={`/user/$userId/profile`}
          >
            <LuUser className="mr-2 size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center"
          onSelect={(event) => {
            event.preventDefault();
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
          }}
        >
          {currentTheme === 'light' ? (
            <LuMoon className="mr-2 size-4" />
          ) : (
            <LuSun className="mr-2 size-4" />
          )}
          Toggle theme
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center text-red-500"
          onClick={async () => {
            await authClient.signOut();
            await queryClient.resetQueries({
              queryKey: userQuery.queryKey,
            });
            await router.navigate({ to: '/' });
          }}
        >
          <LuLogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
