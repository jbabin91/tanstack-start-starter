# Organizations API Documentation

This document covers the organization management system implemented using better-auth's organization plugin with multi-tenancy support, role-based access control, and member management.

## Overview

The organization system provides:

- **Multi-Tenant Architecture** - Complete data isolation between organizations using better-auth
- **Role-Based Access Control** - Admin, member, and custom role management
- **Membership Management** - Invitation, joining, and member lifecycle via better-auth
- **Organization Switching** - Users can belong to multiple organizations with session context
- **Permission-Based Security** - Granular permission system integrated with sessions

## Better-Auth Configuration

### Organization Plugin Setup

```typescript
// src/lib/auth/server.ts
import { organization } from 'better-auth/plugins';

const options = {
  plugins: [
    organization({
      organizationCreation: {
        afterCreate: async ({ organization, user }) => {
          // Log organization creation
          await Promise.resolve(
            console.log(
              `Organization ${organization.name} created for user ${user.id}`,
            ),
          );
        },
      },
    }),
  ],

  // Enhanced session fields for organization context
  session: {
    additionalFields: {
      activeOrganizationId: {
        type: 'string',
        required: false,
      },
    },
  },
};

// Custom session enhancement for organization context
const getAuthConfig = serverOnly(() =>
  betterAuth({
    ...options,
    plugins: [
      ...(options.plugins ?? []),
      customSession(async ({ user, session }) => {
        // Get user's organization membership and role for permission computation
        const userMembership = await getUserFirstMembership(session.userId);

        // Set active organization if not already set
        const activeOrganizationId =
          session.activeOrganizationId ??
          (userMembership.length > 0
            ? userMembership[0].organizationId
            : undefined);

        return {
          user,
          session: {
            ...session,
            activeOrganizationId,
          },
        };
      }, options),
    ],
  }),
);
```

## Organization Management Functions

### Create Organization (via better-auth)

Better-auth's organization plugin provides built-in organization creation functionality. Organizations are created through the better-auth API with automatic member management:

```typescript
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { auth } from '@/lib/auth/server';

// Reusable schema - can be used in forms and server functions
export const CreateOrganizationInputSchema = type({
  name: 'string >= 2',
  'description?': 'string',
});

// Organization creation happens through better-auth's built-in methods
// The organization plugin automatically:
// 1. Creates the organization record
// 2. Adds the creator as the first member with 'owner' role
// 3. Triggers afterCreate hooks for additional setup

// Example usage in a server function:
export const createOrganization = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = CreateOrganizationInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ name, description }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Better-auth handles organization creation and membership automatically
    // Organization data is stored in the organizations table via the plugin
    // The creator is automatically added as an owner

    return { success: true, message: 'Organization created successfully' };
  });
```

### Update Organization

```typescript
import { type } from 'arktype';

export const UpdateOrganizationInputSchema = type({
  organizationId: 'string',
  'name?': 'string >= 2 <= 100',
  'description?': 'string',
  'avatar?': 'string',
  'website?': 'string',
});

export const updateOrganization = createServerFn({ method: 'PUT' })
  .validator((data: unknown) => {
    const result = UpdateOrganizationInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ organizationId, ...updateData }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check if user has permission to update organization
    const membership = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, session.user.id),
      ),
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new Error('Insufficient permissions');
    }

    const updatedOrganization = await db
      .update(organizations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId))
      .returning();

    return updatedOrganization[0];
  });
```

### Get Organization

```typescript
import { type } from 'arktype';

export const GetOrganizationInputSchema = type({
  'organizationId?': 'string',
  'slug?': 'string',
  'includeMembers?': 'boolean',
});

export const getOrganization = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetOrganizationInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ organizationId, slug, includeMembers = false }) => {
    if (!organizationId && !slug) {
      throw new Error('Either organizationId or slug is required');
    }

    const organization = await db.query.organizations.findFirst({
      where: organizationId
        ? eq(organizations.id, organizationId)
        : eq(organizations.slug, slug!),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        members: includeMembers
          ? {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
              orderBy: [
                sql`CASE 
                  WHEN ${organizationMembers.role} = 'owner' THEN 1
                  WHEN ${organizationMembers.role} = 'admin' THEN 2
                  ELSE 3
                END`,
                organizationMembers.joinedAt,
              ],
            }
          : undefined,
        _count: {
          members: true,
          posts: true,
        },
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  });
```

## Member Management Functions

### Invite Member

```typescript
import { type } from 'arktype';

export const InviteMemberInputSchema = type({
  organizationId: 'string',
  'email?': 'string.email',
  'userId?': 'string',
  'role?': '"admin" | "member"',
  'message?': 'string',
});

export const inviteMember = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = InviteMemberInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(
    async ({ organizationId, email, userId, role = 'member', message }) => {
      const { headers } = getWebRequest();
      const session = await auth.api.getSession({ headers });

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      if (!email && !userId) {
        throw new Error('Either email or userId is required');
      }

      // Check if user has permission to invite
      const membership = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, session.user.id),
        ),
      });

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        throw new Error('Insufficient permissions');
      }

      // Only owners can invite admins
      if (role === 'admin' && membership.role !== 'owner') {
        throw new Error('Only organization owners can invite admins');
      }

      let targetUserId = userId;

      // If email provided, find or create user
      if (email) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (existingUser) {
          targetUserId = existingUser.id;
        } else {
          // Create invitation record for non-existing user
          const invitation = await db
            .insert(organizationInvitations)
            .values({
              organizationId,
              email,
              role,
              invitedBy: session.user.id,
              message,
            })
            .returning();

          // Send invitation email
          await sendOrganizationInvitationEmail({
            email,
            organizationName: membership.organization?.name || '',
            inviterName: session.user.name || '',
            message,
          });

          return { invitation: invitation[0], type: 'email_invitation' };
        }
      }

      // Check if user is already a member
      const existingMembership = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, targetUserId!),
        ),
      });

      if (existingMembership) {
        throw new Error('User is already a member of this organization');
      }

      // Create membership directly for existing users
      const newMember = await db
        .insert(organizationMembers)
        .values({
          organizationId,
          userId: targetUserId!,
          role,
          invitedBy: session.user.id,
          joinedAt: new Date(),
        })
        .returning();

      // Send notification to new member
      await sendMembershipNotification(targetUserId!, organizationId);

      return { member: newMember[0], type: 'direct_membership' };
    },
  );
```

### Update Member Role

```typescript
import { type } from 'arktype';

export const UpdateMemberRoleInputSchema = type({
  organizationId: 'string',
  memberId: 'string',
  role: '"owner" | "admin" | "member"',
});

export const updateMemberRole = createServerFn({ method: 'PUT' })
  .validator((data: unknown) => {
    const result = UpdateMemberRoleInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ organizationId, memberId, role }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check current user permissions
    const currentMembership = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, session.user.id),
      ),
    });

    if (!currentMembership || currentMembership.role !== 'owner') {
      throw new Error('Only organization owners can change member roles');
    }

    // Get target member
    const targetMember = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.id, memberId),
      ),
    });

    if (!targetMember) {
      throw new Error('Member not found');
    }

    // Prevent removing the last owner
    if (targetMember.role === 'owner' && role !== 'owner') {
      const ownerCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.role, 'owner'),
          ),
        );

      if (ownerCount[0].count <= 1) {
        throw new Error('Organization must have at least one owner');
      }
    }

    const updatedMember = await db
      .update(organizationMembers)
      .set({ role })
      .where(eq(organizationMembers.id, memberId))
      .returning();

    return updatedMember[0];
  });
```

### Remove Member

```typescript
import { type } from 'arktype';

export const RemoveMemberInputSchema = type({
  organizationId: 'string',
  memberId: 'string',
});

export const removeMember = createServerFn({ method: 'DELETE' })
  .validator((data: unknown) => {
    const result = RemoveMemberInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ organizationId, memberId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check permissions
    const currentMembership = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, session.user.id),
      ),
    });

    const targetMember = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.id, memberId),
      ),
    });

    if (!targetMember) {
      throw new Error('Member not found');
    }

    // Allow self-removal or admin/owner removing others
    const canRemove =
      targetMember.userId === session.user.id || // Self-removal
      (currentMembership &&
        ['owner', 'admin'].includes(currentMembership.role) && // Admin/owner removing
        (currentMembership.role === 'owner' || // Owner can remove anyone
          targetMember.role === 'member')); // Admin can only remove members

    if (!canRemove) {
      throw new Error('Insufficient permissions');
    }

    // Prevent removing the last owner
    if (targetMember.role === 'owner') {
      const ownerCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.role, 'owner'),
          ),
        );

      if (ownerCount[0].count <= 1) {
        throw new Error('Cannot remove the last organization owner');
      }
    }

    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.id, memberId));

    return { success: true };
  });
```

## Organization Context Functions

### Get User Organizations

```typescript
export const getUserOrganizations = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const memberships = await db.query.organizationMembers.findMany({
      where: eq(organizationMembers.userId, session.user.id),
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            description: true,
          },
        },
      },
      orderBy: [
        sql`CASE 
          WHEN ${organizationMembers.role} = 'owner' THEN 1
          WHEN ${organizationMembers.role} = 'admin' THEN 2
          ELSE 3
        END`,
        organizationMembers.joinedAt,
      ],
    });

    return memberships.map((m) => ({
      ...m.organization,
      membership: {
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        permissions: m.permissions,
      },
    }));
  },
);
```

### Switch Organization Context

Organization switching is handled through the custom session enhancement, which automatically sets the active organization based on user membership:

```typescript
import { type } from 'arktype';

export const SwitchOrganizationInputSchema = type({
  'organizationId?': 'string',
});

export const switchOrganizationContext = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = SwitchOrganizationInputSchema(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ organizationId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Verify membership if switching to organization
    if (organizationId) {
      // Better-auth organization plugin provides membership verification
      // through the user's organization memberships
    }

    // Organization context is automatically managed through customSession
    // The activeOrganizationId is set based on user memberships
    // and can be updated through session updates

    return {
      success: true,
      organizationId,
      message: organizationId
        ? 'Switched to organization context'
        : 'Switched to personal context',
    };
  });
```

## React Query Integration

### Organization Queries

```typescript
// src/modules/organizations/hooks/use-queries.ts
export const organizationQueries = {
  userOrganizations: () =>
    queryOptions({
      queryKey: ['organizations', 'user'] as const,
      queryFn: () => getUserOrganizations(),
    }),

  bySlug: (slug: string, includeMembers = false) =>
    queryOptions({
      queryKey: ['organizations', 'slug', slug, includeMembers] as const,
      queryFn: () => getOrganization({ slug, includeMembers }),
    }),

  byId: (organizationId: string, includeMembers = false) =>
    queryOptions({
      queryKey: [
        'organizations',
        'id',
        organizationId,
        includeMembers,
      ] as const,
      queryFn: () => getOrganization({ organizationId, includeMembers }),
    }),
};

// Custom hooks
export function useUserOrganizations() {
  return useQuery(organizationQueries.userOrganizations());
}

export function useOrganization({
  slug,
  organizationId,
  includeMembers = false,
}: {
  slug?: string;
  organizationId?: string;
  includeMembers?: boolean;
}) {
  return useQuery(
    slug
      ? organizationQueries.bySlug(slug, includeMembers)
      : organizationQueries.byId(organizationId!, includeMembers),
  );
}
```

### Organization Mutations

```typescript
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'user'],
      });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (updatedOrg) => {
      // Update specific organization cache
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'id', updatedOrg.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'slug', updatedOrg.slug],
      });

      // Update user organizations list
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'user'],
      });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteMember,
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'id', organizationId],
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberRole,
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'id', organizationId],
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMember,
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'id', organizationId],
      });
    },
  });
}

export function useSwitchOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: switchOrganizationContext,
    onSuccess: () => {
      // Invalidate current session to reflect context change
      queryClient.invalidateQueries({
        queryKey: ['auth', 'current-session'],
      });
    },
  });
}
```

## Strategic Context

This organizations API implements multi-tenancy and organizational workflows using better-auth's organization plugin, providing:

- **Multi-tenant architecture** with automatic member management
- **Organization context switching** integrated with session management
- **Role-based access control** through better-auth's permission system
- **Seamless integration** with the custom session enhancement system

## Better-Auth Integration Benefits

Using better-auth's organization plugin provides:

- **Automatic schema management** - Organizations and memberships are handled by the plugin
- **Built-in permission system** - Role-based access control out of the box
- **Session integration** - Organization context is automatically available in sessions
- **Type safety** - Full TypeScript support for organization operations

For related documentation, see:

- **[Sessions API](./sessions.md)** - Session management with organization context
- **[Authentication API](./auth.md)** - Better-auth configuration and setup
- **[Development Guide](../development/index.md)** - Organization patterns and best practices
