import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { and, eq } from 'drizzle-orm';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { sessionActivityLog, sessions } from '@/lib/db/schemas';
import { logger } from '@/lib/logger';
import { nanoid } from '@/lib/nanoid';

const revokeSessionSchema = type({
  sessionId: 'string>=1',
});

export const revokeSession = createServerFn()
  .validator(revokeSessionSchema)
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Unauthorized: No active session');
    }

    const { sessionId } = data;
    logger.info(
      `User ${session.user.id} attempting to revoke session ${sessionId}...`,
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

      // Prevent self-revocation of current session
      if (sessionId === session.session.id) {
        throw new Error(
          'Cannot revoke your current session. Please sign out instead.',
        );
      }

      // Mark the session as expired by setting expiresAt to now
      const now = new Date();
      await db
        .update(sessions)
        .set({
          expiresAt: now,
          updatedAt: now,
        })
        .where(eq(sessions.id, sessionId));

      // Log the session revocation activity
      await db.insert(sessionActivityLog).values({
        id: nanoid(),
        sessionId: session.session.id, // Current session doing the revocation
        userId: session.user.id,
        activityType: 'security_event',
        activityDetails: {
          action: 'session_revoked',
          revokedSessionId: sessionId,
          reason: 'user_initiated',
          timestamp: now.toISOString(),
        },
        ipAddress: targetSession[0].ipAddress,
        userAgent: targetSession[0].userAgent,
        createdAt: now,
      });

      logger.info(
        `Successfully revoked session ${sessionId} for user ${session.user.id}`,
      );

      return {
        success: true,
        message: 'Session revoked successfully',
        revokedSessionId: sessionId,
      };
    } catch (error) {
      logger.error(`Error revoking session ${sessionId}:`, error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to revoke session');
    }
  });
