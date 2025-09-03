import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { members, organizations } from '@/lib/db/schemas/auth';

/**
 * Get user's organization membership and role
 * Consolidated function that handles both specific org lookup and first membership
 */
export async function getUserMembership({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId?: string;
}) {
  return await db
    .select({
      organizationId: members.organizationId,
      organizationRole: members.role,
      organizationName: organizations.name,
    })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(
      and(
        eq(members.userId, userId),
        organizationId ? eq(members.organizationId, organizationId) : undefined,
      ),
    )
    .limit(1);
}
