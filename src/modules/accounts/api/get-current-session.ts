import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { desc, eq } from 'drizzle-orm';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import {
  sessionActivityLog,
  sessionMetadata,
  sessions,
  trustedDevices,
} from '@/lib/db/schemas';
import { apiLogger } from '@/lib/logger';
import type { SessionWithDetails } from '@/modules/accounts/api/get-sessions';

export const fetchCurrentSession = createServerFn().handler(async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw new Error('Unauthorized: No active session');
  }

  apiLogger.info(
    `Fetching current session ${session.session.id} for user ${session.user.id}...`,
  );

  try {
    // Get the current session details
    const currentSession = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, session.session.id))
      .limit(1);

    if (currentSession.length === 0) {
      throw new Error('Current session not found in database');
    }

    // Get session metadata
    const metadata = await db
      .select()
      .from(sessionMetadata)
      .where(eq(sessionMetadata.sessionId, session.session.id))
      .limit(1);

    // Get trusted device if exists
    let trustedDevice = null;
    if (metadata.length > 0) {
      const devices = await db
        .select()
        .from(trustedDevices)
        .where(
          eq(trustedDevices.deviceFingerprint, metadata[0].deviceFingerprint),
        )
        .limit(1);
      trustedDevice = devices.length > 0 ? devices[0] : null;
    }

    // Get recent activity for this session (last 20 activities)
    const recentActivity = await db
      .select()
      .from(sessionActivityLog)
      .where(eq(sessionActivityLog.sessionId, session.session.id))
      .orderBy(desc(sessionActivityLog.createdAt))
      .limit(20);

    const sessionWithDetails: SessionWithDetails = {
      ...currentSession[0],
      metadata: metadata.length > 0 ? metadata[0] : null,
      trustedDevice,
      recentActivity: recentActivity.map((activity) => ({
        ...activity,
        activityDetails: activity.activityDetails ?? {},
      })),
      isCurrentSession: true,
    };

    apiLogger.info(
      `Successfully fetched current session ${session.session.id}`,
    );
    return sessionWithDetails;
  } catch (error) {
    apiLogger.error(error, 'Error fetching current session');
    throw new Error('Failed to fetch current session');
  }
});
