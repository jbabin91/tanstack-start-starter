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

// Predefined accessible color pairs (background: text) for both themes
const colorPairs = {
  dark: [
    { bg: 'bg-blue-800', text: 'text-blue-200' },
    { bg: 'bg-green-800', text: 'text-green-200' },
    { bg: 'bg-purple-800', text: 'text-purple-200' },
    { bg: 'bg-yellow-800', text: 'text-yellow-200' },
    { bg: 'bg-pink-800', text: 'text-pink-200' },
    { bg: 'bg-indigo-800', text: 'text-indigo-200' },
    { bg: 'bg-red-800', text: 'text-red-200' },
    { bg: 'bg-teal-800', text: 'text-teal-200' },
  ],
  light: [
    { bg: 'bg-blue-200', text: 'text-blue-800' },
    { bg: 'bg-green-200', text: 'text-green-800' },
    { bg: 'bg-purple-200', text: 'text-purple-800' },
    { bg: 'bg-yellow-200', text: 'text-yellow-800' },
    { bg: 'bg-pink-200', text: 'text-pink-800' },
    { bg: 'bg-indigo-200', text: 'text-indigo-800' },
    { bg: 'bg-red-200', text: 'text-red-800' },
    { bg: 'bg-teal-200', text: 'text-teal-800' },
  ],
} as const;

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.codePointAt(i) ?? 0;
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function getColorFromName(name: string, theme: 'light' | 'dark' = 'light') {
  const hash = hashString(name);
  const colors = colorPairs[theme];
  const index = hash % colors.length;
  return colors[index];
}

function getUserInitials(name: string) {
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
  const { data: user } = useUser();
  const { setTheme, theme, resolvedTheme } = useTheme();

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

  // Use resolvedTheme to get the actual theme (light/dark) even when set to 'system'
  const currentTheme = (resolvedTheme ?? theme ?? 'light') as 'light' | 'dark';
  const { bg, text } = getColorFromName(user.name, currentTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative size-8 rounded-full" variant="ghost">
          <Avatar className="size-8">
            <AvatarImage alt={user.name} src={user.image ?? undefined} />
            <AvatarFallback className={cn(bg, text)}>
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
