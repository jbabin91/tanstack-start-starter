/**
 * Account Dashboard Component
 *
 * Private account management dashboard showing user profile information,
 * account statistics, and quick access to account features.
 */

import { Link } from '@tanstack/react-router';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/modules/auth/hooks/use-current-user';

export function AccountDashboard() {
  const { data: user } = useCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Icons.user className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No user data</h3>
          <p className="text-muted-foreground">
            Unable to load user information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name ?? user.email}!
          </p>
        </div>
        <Button>
          <Link className="flex items-center" to="/account/sessions">
            <Icons.settings className="mr-2 h-4 w-4" />
            Manage Account
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.user className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage alt={user.name} src={user.image ?? undefined} />
                <AvatarFallback className="text-lg">
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                    : user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                {user.username && (
                  <p className="text-muted-foreground text-sm">
                    @{user.username}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Status</span>
                <Badge variant={user.emailVerified ? 'success' : 'secondary'}>
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>

              {user.role && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Role</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-muted-foreground text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.mail className="h-5 w-5" />
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Icons.mail className="text-muted-foreground h-4 w-4" />
                <span>{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Icons.phone className="text-muted-foreground h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Icons.globe className="text-muted-foreground h-4 w-4" />
                  <a
                    className="text-primary hover:underline"
                    href={user.website}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {user.website}
                  </a>
                </div>
              )}

              {user.address && (
                <div className="flex items-center gap-2 text-sm">
                  <Icons.mapPin className="text-muted-foreground h-4 w-4" />
                  <span>{user.address}</span>
                </div>
              )}
            </div>

            {(!user.phone || !user.website || !user.address) && (
              <div className="space-y-3">
                <Separator />
                <Button className="w-full" size="sm" variant="outline">
                  <Link className="flex items-center" to="/dashboard">
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Complete Profile
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <Link className="flex items-center" to="/dashboard">
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>

            <Button className="w-full" variant="outline">
              <Link className="flex items-center" to="/account/sessions">
                <Icons.shield className="mr-2 h-4 w-4" />
                Security Settings
              </Link>
            </Button>

            <Button className="w-full" variant="outline">
              <Link className="flex items-center" to="/users">
                <Icons.users className="mr-2 h-4 w-4" />
                Browse Users
              </Link>
            </Button>

            <Button className="w-full" variant="outline">
              <Link
                className="flex items-center"
                params={{ userId: user.id }}
                to="/users/$userId/posts"
              >
                <Icons.fileText className="mr-2 h-4 w-4" />
                My Posts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Status */}
      {(Boolean(user.banned) || !user.emailVerified) && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Icons.alertTriangle className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.banned && (
              <div className="border-destructive/20 bg-destructive/10 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Icons.ban className="text-destructive h-4 w-4" />
                  <span className="text-destructive font-medium">
                    Account Suspended
                  </span>
                </div>
                {user.banReason && (
                  <p className="text-destructive/80 mt-1 text-sm">
                    Reason: {user.banReason}
                  </p>
                )}
                {user.banExpires && (
                  <p className="text-destructive/80 mt-1 text-sm">
                    Expires: {new Date(user.banExpires).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {!user.emailVerified && (
              <div className="border-warning/20 bg-warning/10 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Icons.mail className="text-warning h-4 w-4" />
                  <span className="text-warning font-medium">
                    Email Not Verified
                  </span>
                </div>
                <p className="text-warning/80 mt-1 text-sm">
                  Please check your email and verify your account to access all
                  features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
