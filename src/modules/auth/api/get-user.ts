import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth/server';
import { computePermissions } from '@/lib/auth/types';
import { getUserMembership } from '@/lib/auth/utils/membership-queries';
import { logger } from '@/lib/logger';

export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) return null;

    // Get user's organization membership and role
    const activeOrgId = session.session.activeOrganizationId ?? undefined;
    const membership = await getUserMembership({
      userId: session.user.id,
      organizationId: activeOrgId,
    });

    const orgRole =
      membership.length > 0 ? membership[0].organizationRole : null;
    const orgName =
      membership.length > 0 ? membership[0].organizationName : null;
    const orgId = membership.length > 0 ? membership[0].organizationId : null;

    // Compute permissions based on system role and organization role
    const permissions = computePermissions(session.user.role, orgRole);

    return {
      ...session.user,
      permissions,
      organizationRole: orgRole,
      activeOrganizationId: orgId,
      activeOrganizationName: orgName,
    };
  } catch (error) {
    // Handle database connection errors gracefully
    // Return null so public routes can still function
    logger.warn('Failed to get user session:', error);
    return null;
  }
});
