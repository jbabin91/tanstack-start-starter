import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { and, desc, eq, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import {
  sessionActivityLog,
  sessionMetadata,
  sessions,
  trustedDevices,
} from '@/lib/db/schemas';
import { logger } from '@/lib/logger';

export type SessionWithDetails = {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  impersonatedBy: string | null;
  activeOrganizationId: string | null;
  metadata: {
    id: string;
    deviceFingerprint: string;
    deviceType: string;
    deviceName: string | null;
    browserName: string | null;
    browserVersion: string | null;
    osName: string | null;
    osVersion: string | null;
    isMobile: boolean;
    countryCode: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
    ispName: string | null;
    connectionType: string | null;
    securityScore: number;
    isTrustedDevice: boolean;
    suspiciousActivityCount: number;
    lastActivityAt: Date;
    pageViewsCount: number;
    requestsCount: number;
    lastPageVisited: string | null;
    sessionDurationSeconds: number | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  trustedDevice: {
    id: string;
    deviceFingerprint: string;
    deviceName: string;
    deviceType: string;
    trustLevel: string;
    isActive: boolean;
    firstSeenAt: Date;
    lastSeenAt: Date;
    trustedAt: Date;
    expiresAt: Date | null;
  } | null;
  recentActivity: {
    id: string;
    activityType: string;
    activityDetails: any;
    ipAddress: string | null;
    userAgent: string | null;
    requestPath: string | null;
    httpMethod: string | null;
    responseStatus: number | null;
    responseTimeMs: number | null;
    createdAt: Date;
  }[];
  isCurrentSession: boolean;
};

export const fetchSessions = createServerFn().handler(async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new Error('Unauthorized: No active session');
  }

  logger.info(`Fetching sessions for user ${session.user.id}...`);

  try {
    // Get all sessions for the user
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, session.user.id))
      .orderBy(desc(sessions.updatedAt));

    // Get session metadata for all sessions
    const sessionIds = userSessions.map((s) => s.id);
    const metadata = await db
      .select()
      .from(sessionMetadata)
      .where(
        sessionIds.length > 0
          ? inArray(sessionMetadata.sessionId, sessionIds)
          : undefined,
      );

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

    logger.info(
      `Successfully fetched ${sessionsWithDetails.length} sessions for user ${session.user.id}`,
    );
    return sessionsWithDetails;
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    throw new Error('Failed to fetch sessions');
  }
});
