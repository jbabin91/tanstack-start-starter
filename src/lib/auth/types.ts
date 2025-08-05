/**
 * Role and Permission Types for TanStack Start Application
 *
 * This module defines the type system for roles and permissions,
 * used throughout the application for access control.
 */

import type {
  organizationRoleEnum,
  systemRoleEnum,
  User,
} from '@/lib/db/schemas/auth';

// ============================================================================
// Role Definitions
// ============================================================================

/**
 * System-wide roles that determine base permissions
 * Inferred from database enum for single source of truth
 */
export type SystemRole = (typeof systemRoleEnum.enumValues)[number];

/**
 * Organization-specific roles for team management
 * Inferred from database enum for single source of truth
 */
export type OrganizationRole = (typeof organizationRoleEnum.enumValues)[number];

// Constants for easy access (derived from database enums)
export const SYSTEM_ROLES = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
  SUPER_ADMIN: 'super_admin' as const,
} satisfies Record<string, SystemRole>;

export const ORGANIZATION_ROLES = {
  MEMBER: 'member' as const,
  ADMIN: 'admin' as const,
  OWNER: 'owner' as const,
} satisfies Record<string, OrganizationRole>;

// ============================================================================
// Permission Definitions
// ============================================================================

/**
 * Granular permissions following resource:action pattern
 */
export type Permission =
  // Post permissions
  | 'posts:create'
  | 'posts:edit'
  | 'posts:delete'
  | 'posts:publish'
  | 'posts:moderate'
  // User permissions
  | 'users:view'
  | 'users:edit'
  | 'users:delete'
  | 'users:ban'
  // Organization permissions
  | 'org:invite'
  | 'org:manage'
  | 'org:billing'
  | 'org:delete'
  // Admin permissions
  | 'admin:access'
  | 'admin:manage'
  | 'admin:system'
  // System permissions
  | 'system:analytics'
  | 'system:settings'
  | 'system:maintenance';

// ============================================================================
// User Context Types
// ============================================================================

/**
 * User with computed permissions and organization context
 * This is the primary type used in route context throughout the app
 */
export type UserWithPermissions = User & {
  /** Computed permissions based on role and organization membership */
  permissions: Permission[];
  /** Current organization role if activeOrganizationId is set */
  organizationRole?: OrganizationRole;
  /** Currently active organization ID from session */
  activeOrganizationId?: string;
  /** Currently active organization name for display */
  activeOrganizationName?: string;
};

/**
 * Minimal user type for public contexts
 */
export type PublicUser = Pick<User, 'id' | 'name' | 'username' | 'image'>;

/**
 * User session with permissions for server-side checks
 */
export type AuthenticatedSession = {
  user: UserWithPermissions;
  sessionId: string;
  expiresAt: Date;
};

// ============================================================================
// Route Context Types
// ============================================================================

/**
 * Type for the root route context
 * Used in createRootRouteWithContext
 */
export type RootRouteContext = {
  queryClient: any; // Would be QueryClient from @tanstack/react-query
  user: UserWithPermissions | null;
};

/**
 * Type for protected route context
 * Used in routes under /_app
 */
export type ProtectedRouteContext = {
  queryClient: any; // Would be QueryClient from @tanstack/react-query
  user: UserWithPermissions; // Non-null in protected routes
};

// ============================================================================
// Permission Checking Types
// ============================================================================

/**
 * Permission check result with reason for debugging
 */
export type PermissionCheckResult = {
  allowed: boolean;
  reason?: string;
  requiredRole?: SystemRole | OrganizationRole;
};

/**
 * Resource ownership check parameters
 */
export type ResourceOwnership = {
  resourceId: string;
  ownerId: string;
  resourceType: 'post' | 'comment' | 'organization' | 'project';
};

// ============================================================================
// Helper Type Guards
// ============================================================================

/**
 * Type guard to check if a user has permissions
 */
export function isUserWithPermissions(
  user: User | UserWithPermissions | null,
): user is UserWithPermissions {
  return (
    user !== null && 'permissions' in user && Array.isArray(user.permissions)
  );
}

/**
 * Type guard to check if a role is a system role
 */
export function isSystemRole(role: string): role is SystemRole {
  return Object.values(SYSTEM_ROLES).includes(role as SystemRole);
}

/**
 * Type guard to check if a role is an organization role
 */
export function isOrganizationRole(role: string): role is OrganizationRole {
  return Object.values(ORGANIZATION_ROLES).includes(role as OrganizationRole);
}

// ============================================================================
// Permission Computation
// ============================================================================

/**
 * Permission configuration - declarative approach following KISS principles
 * Makes it easy to modify permissions without changing logic
 */
const PERMISSION_CONFIG = {
  system: {
    [SYSTEM_ROLES.USER]: ['posts:create'],
    [SYSTEM_ROLES.ADMIN]: [
      'posts:create',
      'posts:edit',
      'posts:delete',
      'posts:publish',
      'posts:moderate',
      'users:view',
      'users:edit',
      'admin:access',
    ],
    [SYSTEM_ROLES.SUPER_ADMIN]: [
      'posts:create',
      'posts:edit',
      'posts:delete',
      'posts:publish',
      'posts:moderate',
      'users:view',
      'users:edit',
      'users:delete',
      'users:ban',
      'admin:access',
      'admin:manage',
      'admin:system',
      'system:analytics',
      'system:settings',
      'system:maintenance',
    ],
  },
  organization: {
    [ORGANIZATION_ROLES.MEMBER]: [],
    [ORGANIZATION_ROLES.ADMIN]: ['org:invite', 'org:manage'],
    [ORGANIZATION_ROLES.OWNER]: [
      'org:invite',
      'org:manage',
      'org:billing',
      'org:delete',
    ],
  },
} as const satisfies Record<
  'system' | 'organization',
  Record<string, readonly Permission[]>
>;

/**
 * Compute permissions based on system role and organization role
 * Uses declarative configuration for maintainability
 */
export function computePermissions(
  systemRole?: string | null,
  organizationRole?: string | null,
): Permission[] {
  const systemPermissions = systemRole
    ? (PERMISSION_CONFIG.system[systemRole as SystemRole] ?? [])
    : [];

  const orgPermissions = organizationRole
    ? (PERMISSION_CONFIG.organization[organizationRole as OrganizationRole] ??
      [])
    : [];

  // Combine and deduplicate permissions
  return [...new Set([...systemPermissions, ...orgPermissions])];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: UserWithPermissions | null,
  permission: Permission,
): boolean {
  return user?.permissions.includes(permission) ?? false;
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  user: UserWithPermissions | null,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  user: UserWithPermissions | null,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}
