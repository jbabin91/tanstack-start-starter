/**
 * Permission computation utilities for role-based access control
 *
 * This module contains the implementation logic for computing and checking permissions
 * based on system roles and organization roles.
 */

import {
  ORGANIZATION_ROLES,
  type OrganizationRole,
  type Permission,
  SYSTEM_ROLES,
  type SystemRole,
  type UserWithPermissions,
} from '@/lib/auth/types';
import type { User } from '@/lib/db/schemas/auth';

// ============================================================================
// Permission Configuration
// ============================================================================

/**
 * Permission configuration - declarative approach following KISS principles
 * Makes it easy to modify permissions without changing logic
 */
const PERMISSION_CONFIG = {
  system: {
    user: ['posts:create'],
    admin: [
      'posts:create',
      'posts:edit',
      'posts:delete',
      'posts:publish',
      'posts:moderate',
      'users:view',
      'users:edit',
      'admin:access',
    ],
    super_admin: [
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
    member: [],
    admin: ['org:invite', 'org:manage'],
    owner: ['org:invite', 'org:manage', 'org:billing', 'org:delete'],
  },
} as const satisfies Record<
  'system' | 'organization',
  Record<string, readonly Permission[]>
>;

// ============================================================================
// Permission Computation
// ============================================================================

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

// ============================================================================
// Permission Checking Utilities
// ============================================================================

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

// ============================================================================
// Type Guard Utilities
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
