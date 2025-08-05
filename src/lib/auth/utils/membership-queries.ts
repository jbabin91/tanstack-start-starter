/**
 * Database query helpers for user membership and organization context
 * Centralizes membership query logic to follow DRY principles
 */

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { members, organizations } from '@/lib/db/schemas/auth';

/**
 * Get user's organization membership and role
 * Used by both session and user hooks to avoid duplication
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

/**
 * Get user's first organization membership (for default active org)
 */
export async function getUserFirstMembership(userId: string) {
  return await db
    .select({
      organizationId: members.organizationId,
      organizationRole: members.role,
      organizationName: organizations.name,
    })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(eq(members.userId, userId))
    .limit(1);
}
