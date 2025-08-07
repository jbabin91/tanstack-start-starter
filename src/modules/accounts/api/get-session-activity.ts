import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { and, desc, eq } from 'drizzle-orm';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { sessionActivityLog, sessions } from '@/lib/db/schemas';
import { logger } from '@/lib/logger';

const sessionActivitySchema = type({
  sessionId: 'string>=1',
  'limit?': 'number>=1',
}).pipe((input) => ({
  sessionId: input.sessionId,
  limit: Math.min(input.limit ?? 50, 100), // Ensure max 100
}));

export type SessionActivity = {
  id: string;
  sessionId: string;
  userId: string;
  activityType: string;
  activityDetails: any;
  ipAddress: string | null;
  userAgent: string | null;
  requestPath: string | null;
  httpMethod: string | null;
  responseStatus: number | null;
  responseTimeMs: number | null;
  createdAt: Date;
};

export const fetchSessionActivity = createServerFn()
  .validator(sessionActivitySchema)
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Unauthorized: No active session');
    }

    const { sessionId, limit } = data;
    logger.info(
      `Fetching activity for session ${sessionId} (limit: ${limit}) by user ${session.user.id}...`,
    );

    try {
      // Verify the session belongs to the current user
      const targetSession = await db
        .select()
        .from(sessions)
        .where(
          and(eq(sessions.id, sessionId), eq(sessions.userId, session.user.id)),
        )
        .limit(1);

      if (targetSession.length === 0) {
        throw new Error('Session not found or does not belong to current user');
      }

      // Fetch session activity logs
      const activities = await db
        .select()
        .from(sessionActivityLog)
        .where(eq(sessionActivityLog.sessionId, sessionId))
        .orderBy(desc(sessionActivityLog.createdAt))
        .limit(limit);

      logger.info(
        `Successfully fetched ${activities.length} activity logs for session ${sessionId}`,
      );

      return {
        sessionId,
        activities: activities as SessionActivity[],
        total: activities.length,
        hasMore: activities.length === limit, // Simple indication if there might be more
      };
    } catch (error) {
      logger.error(error, `Error fetching activity for session ${sessionId}`);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to fetch session activity');
    }
  });
