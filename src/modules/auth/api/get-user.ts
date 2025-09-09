import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { computePermissions } from '@/lib/auth/permissions';
import { auth } from '@/lib/auth/server';
import { getUserMembership } from '@/lib/auth/utils/membership-queries';
import {
  authLogger,
  createRequestContext,
  runWithRequestContextAsync,
} from '@/lib/logger';

export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) return null;

    // Create request context for automatic correlation throughout this request
    const requestContext = createRequestContext(session.user.id);

    return runWithRequestContextAsync(requestContext, async () => {
      // Now all logging within this context will automatically include the request ID and user ID
      authLogger.info('Getting user session with permissions');

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

      authLogger.info(
        {
          organizationId: orgId,
          organizationRole: orgRole,
          permissionCount: permissions.length,
        },
        'Successfully computed user permissions',
      );

      return {
        ...session.user,
        permissions,
        organizationRole: orgRole,
        activeOrganizationId: orgId,
        activeOrganizationName: orgName,
      };
    });
  } catch (error) {
    // Handle database connection errors gracefully
    // Return null so public routes can still function
    authLogger.warn({ err: error }, 'Failed to get user session');
    return null;
  }
});
