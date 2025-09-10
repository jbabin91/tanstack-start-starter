import { useMemo, useState } from 'react';

import { Icons } from '@/components/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionActivity } from '@/modules/accounts/components/session-activity';
import { SessionsList } from '@/modules/accounts/components/sessions-list';
import {
  useSessionActivity,
  useSessions,
} from '@/modules/accounts/hooks/use-queries';

export function SessionsManager() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const { data: sessions } = useSessions();
  const { data: activityData } = useSessionActivity({
    sessionId: selectedSessionId ?? '',
  });

  const sessionItems = useMemo(() => {
    return (
      sessions?.map((session) => ({
        value: session.id,
        label: `${session.metadata?.deviceName ?? 'Unknown Device'}${
          session.isCurrentSession ? ' (Current)' : ''
        }${session.metadata?.city ? ` - ${session.metadata.city}` : ''}`,
      })) ?? []
    );
  }, [sessions]);

  // Calculate security statistics
  const securityStats = sessions
    ? {
        total: sessions.length,
        secure: sessions.filter((s) => (s.metadata?.securityScore ?? 0) >= 80)
          .length,
        moderate: sessions.filter((s) => {
          const score = s.metadata?.securityScore ?? 0;
          return score >= 60 && score < 80;
        }).length,
        lowSecurity: sessions.filter(
          (s) => (s.metadata?.securityScore ?? 0) < 60,
        ).length,
        suspicious: sessions.filter(
          (s) => (s.metadata?.suspiciousActivityCount ?? 0) > 0,
        ).length,
        trusted: sessions.filter((s) => s.metadata?.isTrustedDevice).length,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Session Management
        </h2>
        <p className="text-muted-foreground">
          Manage your active sessions and monitor account activity
        </p>
      </div>

      {/* Security Overview */}
      {securityStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Icons.shield className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats.total}</div>
              <p className="text-muted-foreground text-xs">
                Active devices and browsers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Secure Sessions
              </CardTitle>
              <Icons.checkCircle className="text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {securityStats.secure}
              </div>
              <p className="text-muted-foreground text-xs">
                High security score (80+)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trusted Devices
              </CardTitle>
              <Icons.shield className="text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {securityStats.trusted}
              </div>
              <p className="text-muted-foreground text-xs">Marked as trusted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Security Alerts
              </CardTitle>
              <Icons.alertTriangle className="text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {securityStats.suspicious + securityStats.lowSecurity}
              </div>
              <p className="text-muted-foreground text-xs">
                Requiring attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs className="space-y-4" defaultValue="sessions">
        <TabsList>
          <TabsTrigger className="flex items-center gap-2" value="sessions">
            <Icons.shield />
            Active Sessions
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="activity">
            <Icons.activity />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="sessions">
          <SessionsList />
        </TabsContent>

        <TabsContent className="space-y-4" value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Session Activity</CardTitle>
              <CardDescription>
                View detailed activity logs for your sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                items={sessionItems}
                value={selectedSessionId ?? ''}
                onValueChange={setSelectedSessionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedSessionId
                      ? 'Session selected'
                      : 'Select a session to view activity'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sessionItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSessionId && (
            <SessionActivity
              activities={activityData?.activities ?? []}
              isLoading={!activityData}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
