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
