import { useState } from 'react';

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

      <Tabs className="space-y-4" defaultValue="sessions">
        <TabsList>
          <TabsTrigger className="flex items-center gap-2" value="sessions">
            <Icons.shield className="h-4 w-4" />
            Active Sessions
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="activity">
            <Icons.activity className="h-4 w-4" />
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
                value={selectedSessionId ?? ''}
                onValueChange={setSelectedSessionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a session to view activity" />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.metadata?.deviceName ?? 'Unknown Device'} -
                      {session.isCurrentSession ? ' (Current)' : ''}
                      {session.metadata?.city
                        ? ` - ${session.metadata.city}`
                        : ''}
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
