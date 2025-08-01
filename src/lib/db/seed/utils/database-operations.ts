import { db } from '@/lib/db';
import {
  sessions as sessionsTable,
  users as usersTable,
} from '@/lib/db/schemas/auth';
import { posts as postsTable } from '@/lib/db/schemas/posts';
import {
  sessionActivityLog as sessionActivityLogTable,
  sessionMetadata as sessionMetadataTable,
  trustedDevices as trustedDevicesTable,
} from '@/lib/db/schemas/session-metadata';
import type { SessionData } from '@/lib/db/seed/generators/session-generator';

type UserInsert = typeof usersTable.$inferInsert;
type PostInsert = typeof postsTable.$inferInsert;

/**
 * Insert users into the database and return their IDs
 */
export async function insertUsers(
  users: UserInsert[],
): Promise<{ id: string }[]> {
  return await db
    .insert(usersTable)
    .values(users)
    .returning({ id: usersTable.id });
}

/**
 * Insert posts into the database
 */
export async function insertPosts(posts: PostInsert[]): Promise<void> {
  if (posts.length > 0) {
    await db.insert(postsTable).values(posts);
  }
}

/**
 * Insert session-related data into the database
 */
export async function insertSessionData(
  sessionData: SessionData,
): Promise<void> {
  const { sessions, sessionMetadata, trustedDevices, activityLogs } =
    sessionData;

  // Insert sessions
  if (sessions.length > 0) {
    await db.insert(sessionsTable).values(sessions);
    console.log(`📱 Created ${sessions.length} sessions`);
  }

  // Insert session metadata
  if (sessionMetadata.length > 0) {
    await db.insert(sessionMetadataTable).values(sessionMetadata);
    console.log(
      `🔍 Created ${sessionMetadata.length} session metadata records`,
    );
  }

  // Insert trusted devices
  if (trustedDevices.length > 0) {
    await db.insert(trustedDevicesTable).values(trustedDevices);
    console.log(`🛡️ Created ${trustedDevices.length} trusted devices`);
  }

  // Insert activity logs
  if (activityLogs.length > 0) {
    await db.insert(sessionActivityLogTable).values(activityLogs);
    console.log(`📊 Created ${activityLogs.length} activity log entries`);
  }
}
