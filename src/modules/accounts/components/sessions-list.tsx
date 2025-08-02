import { Icons } from '@/components/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SessionCard } from '@/modules/accounts/components/session-card';
import { useRevokeSession } from '@/modules/accounts/hooks/use-mutations';
import { useSessions } from '@/modules/accounts/hooks/use-queries';

export function SessionsList() {
  const { data: sessions, isLoading, error } = useSessions();
  const revokeMutation = useRevokeSession();

  const handleRevoke = async (sessionId: string) => {
    await revokeMutation.mutateAsync({ data: { sessionId } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load sessions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Alert>
        <AlertDescription>No active sessions found.</AlertDescription>
      </Alert>
    );
  }

  // Find current session
  const currentSession = sessions.find((s) => s.isCurrentSession);
  const otherSessions = sessions.filter((s) => !s.isCurrentSession);

  return (
    <div className="space-y-6">
      {currentSession && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Current Session</h3>
          <SessionCard
            isCurrentSession={true}
            session={currentSession}
            onRevoke={handleRevoke}
          />
        </div>
      )}

      {otherSessions.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Other Sessions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {otherSessions.map((session) => (
              <SessionCard
                key={session.id}
                isCurrentSession={false}
                session={session}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
