import { createFileRoute } from '@tanstack/react-router';
import { FiEdit2 } from 'react-icons/fi';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useUser } from '~/features/users/hooks/use-user';
import { ensureUserProfile } from '~/features/users/hooks/use-user-profile';

export const Route = createFileRoute('/_app/user/$userId/profile')({
  loader: async ({ params: { userId }, context: { queryClient } }) => {
    try {
      const user = await ensureUserProfile(queryClient, userId);
      return { user };
    } catch (error) {
      console.error('User not found', { userId, error });
      // throw notFound({
      //   data: {
      //     title: 'User Not Found',
      //     description: "We couldn't find the user you're looking for.",
      //   },
      // });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useLoaderData()!;
  const { data: currentUser } = useUser();
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <div className="relative h-48">
          <div className="h-32 w-full rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <Avatar className="border-background h-24 w-24 border-4">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardHeader className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
            {isOwnProfile && (
              <Button
                className="h-8 w-8 rounded-full p-0"
                size="sm"
                variant="ghost"
              >
                <FiEdit2 className="h-4 w-4" />
                <span className="sr-only">Edit Profile</span>
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">{user.email}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {user.bio && (
            <div className="relative">
              <h3 className="mb-2 font-semibold">About</h3>
              <p className="text-muted-foreground">{user.bio}</p>
              {isOwnProfile && (
                <Button
                  className="absolute top-0 right-0 h-6 w-6 rounded-full p-0"
                  size="sm"
                  variant="ghost"
                >
                  <FiEdit2 className="h-3 w-3" />
                  <span className="sr-only">Edit Bio</span>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
