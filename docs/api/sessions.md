# Session Management API Documentation

This document covers the comprehensive session management system implemented with better-auth multi-session support, including device tracking, activity logging, and security features.

## Overview

The session management system provides:

- **Multi-Session Support** - Users can be logged in from multiple devices simultaneously
- **Device Fingerprinting** - Unique device identification and tracking
- **Session Metadata** - Detailed information about each session including browser, OS, location
- **Activity Logging** - Comprehensive tracking of user actions and security events
- **Trusted Devices** - Device trust management for enhanced security

## Session Data Structure

### Core Session Data

```typescript
export type SessionWithDetails = Session & {
  metadata: SessionMetadata | null;
  trustedDevice: TrustedDevice | null;
  recentActivity: SessionActivityLog[];
  isCurrentSession: boolean;
};
```

### Session Metadata

```typescript
type SessionMetadata = {
  id: string;
  sessionId: string;
  deviceFingerprint: string;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  country: string | null;
  city: string | null;
  timezone: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

### Activity Tracking

```typescript
type ActivityDetails =
  | { type: 'login'; method: string; success: boolean }
  | { type: 'logout'; reason?: string }
  | { type: 'page_view'; path: string; duration?: number }
  | { type: 'api_call'; endpoint: string; statusCode: number }
  | {
      type: 'security_event';
      level: 'low' | 'medium' | 'high';
      details: string;
    };
```

## Server Functions

### `fetchSessions`

Retrieves all active sessions for the current user with full metadata.

```typescript
// src/modules/accounts/api/get-sessions.ts
export const fetchSessions = createServerFn().handler(async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new Error('Unauthorized: No active session');
  }

  // Get all active (non-expired) sessions for the user
  const userSessions = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, session.user.id),
        gt(sessions.expiresAt, new Date()), // Only non-expired sessions
      ),
    )
    .orderBy(desc(sessions.updatedAt));

  // Enrich with metadata, trusted devices, and recent activity
  // ... (implementation combines session data with metadata)

  return sessionsWithDetails;
});
```

**Response Format:**

```typescript
type SessionWithDetails = {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  activeOrganizationId?: string;
  metadata: SessionMetadata | null;
  trustedDevice: TrustedDevice | null;
  recentActivity: SessionActivityLog[];
  isCurrentSession: boolean;
};
```

### `getCurrentSession`

Gets detailed information about the current session.

```typescript
// src/modules/accounts/api/get-current-session.ts
export const getCurrentSession = createServerFn().handler(async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new Error('Unauthorized: No active session');
  }

  // Get current session with metadata
  const currentSession = await db.query.sessions.findFirst({
    where: eq(sessions.id, session.session.id),
    with: {
      metadata: true,
      trustedDevice: true,
      recentActivity: {
        orderBy: desc(sessionActivityLog.createdAt),
        limit: 20,
      },
    },
  });

  return {
    ...currentSession,
    isCurrentSession: true,
  };
});
```

### `revokeSession`

Terminates a specific session with optional reason logging.

```typescript
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { sessions, sessionActivityLog } from '@/lib/db/schemas';
import { nanoid } from '@/lib/nanoid';

// Reusable schema - can be used in forms and server functions
export const RevokeSessionInputSchema = type({
  sessionId: 'string',
  'reason?': 'string',
});

// src/modules/accounts/api/revoke-session.ts
export const revokeSession = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = RevokeSessionInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ sessionId, reason }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Verify session belongs to current user
    const targetSession = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, session.user.id),
      ),
    });

    if (!targetSession) {
      throw new Error('Session not found or access denied');
    }

    // Log revocation activity
    await db.insert(sessionActivityLog).values({
      id: nanoid(),
      sessionId: targetSession.id,
      activityType: 'logout',
      activityDetails: { type: 'logout', reason },
      ipAddress: extractIPAddress(headers).ipAddress,
      userAgent: headers.get('user-agent') || 'Unknown',
      createdAt: new Date(),
    });

    // Revoke the session
    await auth.api.revokeSession({
      token: targetSession.token,
    });

    return { success: true };
  });
```

## Session Creation & Metadata

### Automatic Session Enhancement

Sessions are automatically enriched with metadata during creation:

```typescript
// src/lib/auth/server.ts - Database hooks
databaseHooks: {
  session: {
    create: {
      before: async (session, context) => {
        // Extract and normalize IP address
        const { ipAddress } = extractIPAddress(
          session.ipAddress,
          context?.request,
        );

        return {
          data: {
            ...session,
            ipAddress: ipAddress ?? session.ipAddress,
          },
        };
      },
      after: async (session, context) => {
        // Create comprehensive session metadata
        await createSessionMetadata({
          sessionId: session.id,
          sessionIP: session.ipAddress,
          request: context?.request,
        });
      },
    },
  },
},
```

### Session Metadata Creation

```typescript
// src/lib/auth/utils/session-metadata-creator.ts
export async function createSessionMetadata({
  sessionId,
  sessionIP,
  request,
}: CreateSessionMetadataParams) {
  const userAgent = request?.headers.get('user-agent') || 'Unknown';

  // Parse user agent for device information
  const { browser, os, device } = parseUserAgent(userAgent);

  // Generate device fingerprint
  const deviceFingerprint = generateDeviceFingerprint({
    userAgent,
    ipAddress: sessionIP,
    acceptLanguage: request?.headers.get('accept-language'),
    acceptEncoding: request?.headers.get('accept-encoding'),
  });

  // Resolve location from IP (if available)
  const location = await resolveLocation(sessionIP);

  // Store session metadata
  await db.insert(sessionMetadata).values({
    id: nanoid(),
    sessionId,
    deviceFingerprint,
    userAgent,
    browser: browser.name || 'Unknown',
    browserVersion: browser.version || 'Unknown',
    os: os.name || 'Unknown',
    osVersion: os.version || 'Unknown',
    device: device.type || 'Unknown',
    country: location?.country || null,
    city: location?.city || null,
    timezone: location?.timezone || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Check for trusted device
  await checkAndUpdateTrustedDevice({
    userId: session.userId,
    deviceFingerprint,
    sessionIP,
  });
}
```

## Activity Logging

### Activity Types

The system tracks various types of user activities:

```typescript
export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAGE_VIEW = 'page_view',
  API_CALL = 'api_call',
  SECURITY_EVENT = 'security_event',
  PERMISSION_CHANGE = 'permission_change',
  ORGANIZATION_SWITCH = 'organization_switch',
}
```

### Logging Activities

```typescript
// src/modules/accounts/api/get-session-activity.ts
export const logActivity = async ({
  sessionId,
  activityType,
  activityDetails,
  ipAddress,
  userAgent,
}: LogActivityParams) => {
  await db.insert(sessionActivityLog).values({
    id: nanoid(),
    sessionId,
    activityType,
    activityDetails,
    ipAddress,
    userAgent,
    createdAt: new Date(),
  });
};

// Usage examples:
await logActivity({
  sessionId: session.id,
  activityType: 'page_view',
  activityDetails: {
    type: 'page_view',
    path: '/dashboard',
    duration: 30000,
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});

await logActivity({
  sessionId: session.id,
  activityType: 'security_event',
  activityDetails: {
    type: 'security_event',
    level: 'medium',
    details: 'Multiple failed login attempts detected',
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});
```

## Trusted Devices

### Device Trust Management

```typescript
export type TrustedDevice = {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  lastSeenAt: Date;
  trustGrantedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Check and update trusted device status
export async function checkAndUpdateTrustedDevice({
  userId,
  deviceFingerprint,
  sessionIP,
}: CheckTrustedDeviceParams) {
  const existingDevice = await db.query.trustedDevices.findFirst({
    where: and(
      eq(trustedDevices.userId, userId),
      eq(trustedDevices.deviceFingerprint, deviceFingerprint),
    ),
  });

  if (existingDevice) {
    // Update last seen timestamp
    await db
      .update(trustedDevices)
      .set({
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trustedDevices.id, existingDevice.id));
  } else {
    // New device - create entry but don't auto-trust
    await db.insert(trustedDevices).values({
      id: nanoid(),
      userId,
      deviceFingerprint,
      deviceName: `New Device - ${sessionIP}`,
      lastSeenAt: new Date(),
      trustGrantedAt: null, // Not trusted yet
      isActive: false, // Must be manually trusted
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
```

## React Query Integration

### Custom Hooks

```typescript
// src/modules/accounts/hooks/use-queries.ts
export const sessionsQueries = {
  all: () => ['sessions'] as const,
  lists: () => [...sessionsQueries.all(), 'list'] as const,
  list: () =>
    queryOptions({
      queryKey: [...sessionsQueries.lists()],
      queryFn: () => fetchSessions(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
  details: () => [...sessionsQueries.all(), 'detail'] as const,
  current: () =>
    queryOptions({
      queryKey: [...sessionsQueries.details(), 'current'],
      queryFn: () => getCurrentSession(),
      staleTime: 1 * 60 * 1000, // 1 minute
    }),
  activity: (sessionId: string) =>
    queryOptions({
      queryKey: [...sessionsQueries.details(), sessionId, 'activity'],
      queryFn: () => getSessionActivity({ sessionId }),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
};

// Custom hooks with object parameters
export function useSessions() {
  return useSuspenseQuery(sessionsQueries.list());
}

export function useCurrentSession() {
  return useSuspenseQuery(sessionsQueries.current());
}

export function useSessionActivity({ sessionId }: { sessionId: string }) {
  return useQuery(sessionsQueries.activity(sessionId));
}
```

### Mutation Hooks

```typescript
// src/modules/accounts/hooks/use-mutations.ts
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: sessionsQueries.all(),
      });
    },
  });
}

export function useTrustDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trustDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionsQueries.all(),
      });
    },
  });
}
```

## UI Components

### Session Management Interface

```typescript
// src/modules/accounts/components/sessions-manager.tsx
export function SessionsManager() {
  const { data: sessions, isLoading } = useSessions();
  const { data: currentSession } = useCurrentSession();
  const { mutate: revokeSession } = useRevokeSession();

  const handleRevokeSession = (sessionId: string, reason?: string) => {
    revokeSession({ sessionId, reason });
  };

  if (isLoading) {
    return <SessionsListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Sessions</h2>
        <Badge variant="secondary">
          {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRevoke={handleRevokeSession}
          />
        ))}
      </div>
    </div>
  );
}
```

### Session Card Component

```typescript
// src/modules/accounts/components/session-card.tsx
interface SessionCardProps {
  session: SessionWithDetails;
  onRevoke: (sessionId: string, reason?: string) => void;
}

export function SessionCard({ session, onRevoke }: SessionCardProps) {
  const formatLastActivity = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className={cn(
      'p-4',
      session.isCurrentSession && 'border-primary bg-primary/5'
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icons.monitor className="size-4" />
            <span className="font-medium">
              {session.metadata?.browser} on {session.metadata?.os}
            </span>
            {session.isCurrentSession && (
              <Badge variant="default" size="sm">Current Session</Badge>
            )}
            {session.trustedDevice?.isActive && (
              <Badge variant="secondary" size="sm">Trusted</Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Icons.mapPin className="size-3" />
              <span>
                {session.metadata?.city && session.metadata?.country
                  ? `${session.metadata.city}, ${session.metadata.country}`
                  : 'Unknown location'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.globe className="size-3" />
              <span>{session.ipAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.clock className="size-3" />
              <span>Last activity {formatLastActivity(session.updatedAt)}</span>
            </div>
          </div>

          {session.recentActivity.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="text-sm text-primary hover:underline">
                View recent activity ({session.recentActivity.length})
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-1">
                  {session.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="text-xs text-muted-foreground">
                      {activity.activityType} - {formatLastActivity(activity.createdAt)}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {!session.isCurrentSession && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Icons.moreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onRevoke(session.id, 'Manual revocation')}
                className="text-destructive"
              >
                <Icons.logOut className="size-4 mr-2" />
                Revoke Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
}
```

## Security Features

### Suspicious Activity Detection

```typescript
// Automatic detection of suspicious patterns
export async function detectSuspiciousActivity(
  userId: string,
  newSession: Session,
): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];
  const recentSessions = await getRecentSessions(userId, '24h');

  // Check for multiple locations
  const locations = recentSessions
    .map((s) => s.metadata?.country)
    .filter(Boolean);

  if (new Set(locations).size > 2) {
    alerts.push({
      level: 'medium',
      type: 'multiple_locations',
      details: 'Login from multiple countries detected',
    });
  }

  // Check for unusual devices
  const deviceFingerprints = recentSessions
    .map((s) => s.metadata?.deviceFingerprint)
    .filter(Boolean);

  if (new Set(deviceFingerprints).size > 3) {
    alerts.push({
      level: 'high',
      type: 'multiple_devices',
      details: 'Login from multiple new devices detected',
    });
  }

  return alerts;
}
```

### Rate Limiting

```typescript
// src/modules/accounts/lib/rate-limiting.ts
export async function checkSessionRateLimit(
  ipAddress: string,
  timeWindow: string = '1h',
): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  const recentSessions = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sessions)
    .where(
      and(
        eq(sessions.ipAddress, ipAddress),
        gte(sessions.createdAt, windowStart),
      ),
    );

  return recentSessions[0].count < SESSION_CREATION_RATE_LIMIT;
}
```

## Configuration

### Environment Variables

```env
# Session Configuration
SESSION_CLEANUP_INTERVAL=3600000  # 1 hour in milliseconds
SESSION_CREATION_RATE_LIMIT=10    # Max sessions per IP per hour
TRUSTED_DEVICE_AUTO_TRUST=false   # Require manual device trust
LOCATION_RESOLUTION_ENABLED=true  # Enable IP geolocation
```

### Database Cleanup

```typescript
// Automatic cleanup of expired sessions and old activity logs
export async function cleanupExpiredSessions() {
  const now = new Date();

  // Remove expired sessions
  await db.delete(sessions).where(lt(sessions.expiresAt, now));

  // Clean old activity logs (keep last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db
    .delete(sessionActivityLog)
    .where(lt(sessionActivityLog.createdAt, thirtyDaysAgo));
}
```

For implementation details and component usage, see:

- [Authentication API](./auth.md)
- [Component Patterns](../development/component-patterns.md)
- [Security Documentation](../security/index.md)
