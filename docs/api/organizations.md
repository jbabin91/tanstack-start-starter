# Organizations API

This document covers all organization management server functions for creating, managing, and switching between organizational contexts.

## Overview

The organization system provides:

- **Organization creation and management** - Create and configure organizations
- **Member management** - Invite, manage, and remove organization members
- **Role-based permissions** - Owner, admin, and member roles with specific capabilities
- **Context switching** - Switch between personal and organization contexts

## Organization Management Functions

### Create Organization

```typescript
export const createOrganization = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      name: t.string().min(2).max(100),
      slug: t.string().min(3).max(50),
      description: t.string().optional(),
      avatar: t.string().optional(),
      website: t.string().optional(),
    }),
  )
  .handler(async ({ name, slug, description, avatar, website }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check if slug is available
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    });

    if (existingOrg) {
      throw new Error('Organization slug is already taken');
    }

    // Create organization
    const organization = await db
      .insert(organizations)
      .values({
        name,
        slug,
        description,
        avatar,
        website,
        ownerId: session.user.id,
      })
      .returning();

    // Add creator as owner member
    await db.insert(organizationMembers).values({
      organizationId: organization[0].id,
      userId: session.user.id,
      role: 'owner',
      joinedAt: new Date(),
    });

    return organization[0];
  });
```

### Update Organization

```typescript
export const updateOrganization = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      organizationId: t.string(),
      name: t.string().min(2).max(100).optional(),
      description: t.string().optional(),
      avatar: t.string().optional(),
      website: t.string().optional(),
    }),
  )
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
export const getOrganization = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      organizationId: t.string().optional(),
      slug: t.string().optional(),
      includeMembers: t.boolean().default(false),
    }),
  )
  .handler(async ({ organizationId, slug, includeMembers }) => {
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
export const inviteMember = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      organizationId: t.string(),
      email: t.string().email().optional(),
      userId: t.string().optional(),
      role: t.enum(['admin', 'member']).default('member'),
      message: t.string().optional(),
    }),
  )
  .handler(async ({ organizationId, email, userId, role, message }) => {
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
  });
```

### Update Member Role

```typescript
export const updateMemberRole = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      organizationId: t.string(),
      memberId: t.string(),
      role: t.enum(['owner', 'admin', 'member']),
    }),
  )
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
export const removeMember = createServerFn({ method: 'DELETE' })
  .validator(
    t.object({
      organizationId: t.string(),
      memberId: t.string(),
    }),
  )
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

```typescript
export const switchOrganizationContext = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      organizationId: t.string().optional(),
    }),
  )
  .handler(async ({ organizationId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Verify membership if switching to organization
    if (organizationId) {
      const membership = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.userId, session.user.id),
          eq(organizationMembers.organizationId, organizationId),
        ),
      });

      if (!membership) {
        throw new Error('Not a member of this organization');
      }
    }

    // Update session context using better-auth
    await auth.api.setSession({
      session: {
        ...session.session,
        organizationId: organizationId || null,
      },
      headers,
    });

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

This organizations API implements the multi-tenancy and organizational workflows outlined in:

- **[Navigation Architecture](../../.serena/memories/ux_architecture_navigation_design.md)** - Organization context switching and member management
- **[Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md)** - Organization publishing workflows

For related documentation, see:

- **[Authentication API](./auth.md)** - Session management and permission integration
- **[Posts API](./posts.md)** - Organization publishing workflows
- **[Development Guide](../development/index.md)** - Organization patterns and best practices
