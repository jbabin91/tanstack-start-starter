import { format } from 'date-fns';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SessionActivity as SessionActivityType } from '@/modules/accounts/api/get-session-activity';

type SessionActivityProps = {
  activities: SessionActivityType[];
  isLoading?: boolean;
};

function getActivityIcon(activityType: string) {
  switch (activityType) {
    case 'sign_in':
    case 'sign_out': {
      return <Icons.shield />;
    }
    case 'api_request': {
      return <Icons.globe />;
    }
    case 'security_event': {
      return <Icons.alertCircle />;
    }
    default: {
      return <Icons.activity />;
    }
  }
}

function getActivityBadge(activityType: string) {
  switch (activityType) {
    case 'sign_in': {
      return <Badge variant="default">Sign In</Badge>;
    }
    case 'sign_out': {
      return <Badge variant="secondary">Sign Out</Badge>;
    }
    case 'session_revoked': {
      return <Badge variant="error">Revoked</Badge>;
    }
    case 'security_event': {
      return <Badge variant="error">Security</Badge>;
    }
    default: {
      return <Badge variant="outline">{activityType}</Badge>;
    }
  }
}

export function SessionActivity({
  activities,
  isLoading,
}: SessionActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.clock size="lg" />
            Activity Log
          </CardTitle>
          <CardDescription>Loading activity...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.clock size="lg" />
            Activity Log
          </CardTitle>
          <CardDescription>No activity recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.clock size="lg" />
          Activity Log
        </CardTitle>
        <CardDescription>Recent activity for this session</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-b pb-4 last:border-0"
              >
                <div className="mt-1">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getActivityBadge(activity.activityType)}
                    <span className="text-muted-foreground text-sm">
                      {format(new Date(activity.createdAt), 'PPpp')}
                    </span>
                  </div>
                  {activity.requestPath && (
                    <p className="text-muted-foreground font-mono text-sm">
                      {activity.httpMethod} {activity.requestPath}
                    </p>
                  )}
                  {activity.activityDetails && (
                    <p className="text-muted-foreground text-sm">
                      {typeof activity.activityDetails === 'string'
                        ? activity.activityDetails
                        : JSON.stringify(activity.activityDetails)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
