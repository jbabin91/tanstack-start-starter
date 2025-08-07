import { formatDistanceToNow } from 'date-fns';

import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SessionWithDetails } from '@/modules/accounts/types';

type SessionCardProps = {
  session: SessionWithDetails;
  isCurrentSession: boolean;
  onRevoke: (sessionId: string) => Promise<void>;
};

function getDeviceIcon(deviceType?: string) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile': {
      return <Icons.smartphone className="h-6 w-6" />;
    }
    case 'tablet': {
      return <Icons.tablet className="h-6 w-6" />;
    }
    case 'desktop': {
      return <Icons.monitor className="h-6 w-6" />;
    }
    default: {
      return <Icons.globe className="h-6 w-6" />;
    }
  }
}

function getDeviceDisplayName(deviceType?: string) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile': {
      return 'Mobile Device';
    }
    case 'tablet': {
      return 'Tablet';
    }
    case 'desktop': {
      return 'Desktop Computer';
    }
    default: {
      return 'Unknown Device';
    }
  }
}

function getSecurityBadge(score?: number) {
  if (!score) return null;

  if (score >= 80) {
    return (
      <Badge className="flex items-center gap-1" variant="default">
        <Icons.shield className="h-3 w-3" />
        Secure
      </Badge>
    );
  }

  if (score >= 60) {
    return (
      <Badge className="flex items-center gap-1" variant="secondary">
        <Icons.shield className="h-3 w-3" />
        Moderate
      </Badge>
    );
  }

  return (
    <Badge className="flex items-center gap-1" variant="error">
      <Icons.alertCircle className="h-3 w-3" />
      Low Security
    </Badge>
  );
}

export function SessionCard({
  session,
  isCurrentSession,
  onRevoke,
}: SessionCardProps) {
  const metadata = session.metadata;
  const lastActivity = metadata?.lastActivityAt
    ? formatDistanceToNow(new Date(metadata.lastActivityAt), {
        addSuffix: true,
      })
    : 'Unknown';

  return (
    <Card className={isCurrentSession ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getDeviceIcon(metadata?.deviceType)}
            <div>
              <CardTitle className="text-base">
                {getDeviceDisplayName(metadata?.deviceType)}
                {isCurrentSession && (
                  <Badge className="ml-2" variant="outline">
                    Current
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {metadata?.browserName && metadata?.osName
                  ? `${metadata.browserName} on ${metadata.osName}`
                  : (metadata?.browserName ??
                    metadata?.osName ??
                    'Unknown browser/OS')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getSecurityBadge(metadata?.securityScore)}
            {metadata?.isTrustedDevice && (
              <Badge variant="secondary">Trusted</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">
              {metadata?.city}, {metadata?.region}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">IP Address</p>
            <p className="font-medium">{session.ipAddress ?? 'Unknown'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Activity</p>
            <p className="font-medium">{lastActivity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">
              {formatDistanceToNow(new Date(session.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {!isCurrentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" color="error" size="sm">
                Revoke Session
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately sign out this device. You&apos;ll need
                  to sign in again on that device to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-error text-error-foreground hover:bg-error/90"
                  onClick={() => onRevoke(session.id)}
                >
                  Revoke Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
