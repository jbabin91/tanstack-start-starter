import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, desc, eq, gt, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import {
  sessionActivityLog,
  sessionMetadata,
  sessions,
  trustedDevices,
} from '@/lib/db/schemas';
// Import session type from auth schema
import type { Session } from '@/lib/db/schemas/auth';
import {
  type SessionActivityLog,
  type SessionMetadata,
  type TrustedDevice,
} from '@/lib/db/schemas/session-metadata';
import { apiLogger } from '@/lib/logger';

// Enhanced activity details with discriminated union (for type-safe access)
export type ActivityDetails =
  | { type: 'login'; method: string; success: boolean }
  | { type: 'logout'; reason?: string }
  | { type: 'page_view'; path: string; duration?: number }
  | { type: 'api_call'; endpoint: string; statusCode: number }
  | {
      type: 'security_event';
      level: 'low' | 'medium' | 'high';
      details: string;
    };

// Compose the final type using arktype-generated types + extensions
// Use the original activityDetails type from the database to avoid conflicts
export type SessionWithDetails = Session & {
  metadata: SessionMetadata | null;
  trustedDevice: TrustedDevice | null;
  recentActivity: SessionActivityLog[];
  isCurrentSession: boolean;
};

export const fetchSessions = createServerFn().handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    apiLogger.warn('Unauthorized session fetch attempt');
    throw new Error('Unauthorized: No active session');
  }

  apiLogger.info({ userId: session.user.id }, 'Starting session fetch');

  try {
    // Get all active (non-expired) sessions for the user
    const userSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, session.user.id),
          gt(sessions.expiresAt, new Date()), // Only include sessions that haven't expired
        ),
      )
      .orderBy(desc(sessions.updatedAt));

    // Get session metadata for all sessions
    const sessionIds = userSessions.map((s) => s.id);
    const metadata =
      sessionIds.length > 0
        ? await db
            .select()
            .from(sessionMetadata)
            .where(inArray(sessionMetadata.sessionId, sessionIds))
        : [];

    // Get trusted devices for the user
    const devices = await db
      .select()
      .from(trustedDevices)
      .where(
        and(
          eq(trustedDevices.userId, session.user.id),
          eq(trustedDevices.isActive, true),
        ),
      );

    // Get recent activity for all sessions (last 10 activities per session)
    const recentActivities =
      sessionIds.length > 0
        ? await db
            .select()
            .from(sessionActivityLog)
            .where(inArray(sessionActivityLog.sessionId, sessionIds))
            .orderBy(desc(sessionActivityLog.createdAt))
            .limit(100) // Limit total activities to prevent huge payloads
        : [];

    // Combine the data
    const sessionsWithDetails: SessionWithDetails[] = userSessions.map((s) => {
      const sessionMeta = metadata.find((m) => m.sessionId === s.id);
      const trustedDevice = sessionMeta
        ? (devices.find(
            (d) => d.deviceFingerprint === sessionMeta.deviceFingerprint,
          ) ?? null)
        : null;
      const activities = recentActivities
        .filter((a) => a.sessionId === s.id)
        .slice(0, 10); // Limit to 10 most recent activities per session

      return {
        ...s,
        metadata: sessionMeta ?? null,
        trustedDevice: trustedDevice ?? null,
        recentActivity: activities,
        isCurrentSession: s.id === session.session.id,
      };
    });

    apiLogger.info(
      { userId: session.user.id },
      `Successfully fetched ${sessionsWithDetails.length} sessions with full details`,
    );
    return sessionsWithDetails;
  } catch (error) {
    apiLogger.error({ err: error }, 'Error fetching sessions');
    throw new Error('Failed to fetch sessions');
  }
});
