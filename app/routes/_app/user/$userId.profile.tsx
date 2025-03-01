import { createFileRoute, notFound } from '@tanstack/react-router';
import { SiDiscord, SiGithub } from 'react-icons/si';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ExampleComponent } from '~/features/example/components/example-component';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  github?: string;
  discord?: string;
  skills: string[];
};

export const Route = createFileRoute('/_app/user/$userId/profile')({
  validateSearch: (_search: Record<string, unknown>) => {
    return {};
  },
  loader: async ({ params: { userId } }) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // TODO: Replace with actual API call using userId
      // For demo purposes, only return user for specific IDs
      const validUserIds = ['1', 'johndoe', 'demo'];
      if (!validUserIds.includes(userId)) {
        throw notFound({
          data: {
            title: 'User Not Found',
            description: "We couldn't find the user you're looking for.",
          },
        });
      }

      const mockUser: User = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatarUrl: 'https://github.com/shadcn.png',
        bio: 'Full-stack developer passionate about building great user experiences.',
        github: 'johndoe',
        discord: 'johndoe#1234',
        skills: ['TypeScript', 'React', 'Node.js', 'TanStack'],
      };

      return {
        user: mockUser,
      };
    } catch (error) {
      // If it's already a notFound error, re-throw it
      if (error instanceof Error && error.name === 'NotFoundError') {
        throw error;
      }
      // For any other errors, throw a notFound with a generic message
      throw notFound({
        data: {
          title: 'Error Loading User',
          description: 'There was an error loading the user profile.',
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="grid gap-8">
        {/* Profile Header */}
        <Card>
          <div className="relative">
            <div className="h-32 w-full rounded-t-lg bg-gradient-to-r from-zinc-500/10 to-zinc-700/20 dark:from-zinc-900/10 dark:to-zinc-900/20" />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <Avatar className="border-background h-24 w-24 border-4">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardHeader className="pt-20 text-center">
            <div className="space-y-2">
              <CardTitle>{user.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <div className="flex justify-center gap-2">
                {user.github && (
                  <Button className="gap-2" size="sm" variant="outline">
                    <SiGithub className="h-4 w-4" />
                    <span className="text-xs">{user.github}</span>
                  </Button>
                )}
                {user.discord && (
                  <Button className="gap-2" size="sm" variant="outline">
                    <SiDiscord className="h-4 w-4" />
                    <span className="text-xs">{user.discord}</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4 text-sm">{user.bio}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Profile Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs className="w-full" defaultValue="overview">
              <TabsList className="w-full justify-center rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent"
                  value="overview"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent"
                  value="settings"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent className="p-6" value="overview">
                <div className="grid gap-6">
                  {/* About */}
                  <div>
                    <h3 className="mb-2 font-semibold">About</h3>
                    <p className="text-muted-foreground text-sm">{user.bio}</p>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="mb-2 font-semibold">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        {user.email}
                      </div>
                      {user.github && (
                        <div>
                          <span className="text-muted-foreground">
                            GitHub:{' '}
                          </span>
                          <a
                            className="text-primary hover:underline"
                            href={`https://github.com/${user.github}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            @{user.github}
                          </a>
                        </div>
                      )}
                      {user.discord && (
                        <div>
                          <span className="text-muted-foreground">
                            Discord:{' '}
                          </span>
                          {user.discord}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent className="p-6" value="settings">
                <div className="text-muted-foreground text-center text-sm">
                  Settings panel coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <ExampleComponent />
      </div>
    </div>
  );
}
