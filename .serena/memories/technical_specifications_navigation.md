# Technical Specifications - Navigation & Avatar Dropdown System

## Overview

Technical implementation specifications for the unified navigation system with context-aware avatar dropdown that consolidates user/organization switching, quick actions, and permission-based features.

## Component Architecture

### 1. Core Navigation Components

#### UserContextDropdown Component

```typescript
// File: src/components/navigation/user-context-dropdown.tsx

interface UserContextDropdownProps {
  className?: string;
}

interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  role: OrganizationRole;
}

interface UserContext extends UserWithPermissions {
  organizations: OrganizationContext[];
  activeOrganization?: OrganizationContext;
}

export function UserContextDropdown({ className }: UserContextDropdownProps) {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  // Context switching logic
  const switchToPersonal = () => {
    // Clear active organization from session
    // Trigger context update
    // Refresh permissions
  };

  const switchToOrganization = (orgId: string) => {
    // Set active organization in session
    // Update user context
    // Refresh permissions
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <ContextAvatar user={user} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* Implementation as per UX spec */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### ContextAvatar Component

```typescript
// File: src/components/navigation/context-avatar.tsx

interface ContextAvatarProps {
  user: UserWithPermissions;
  size?: 'sm' | 'md' | 'lg';
}

export function ContextAvatar({ user, size = 'md' }: ContextAvatarProps) {
  const currentContext = user.activeOrganizationId
    ? user.activeOrganization
    : user;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={currentContext?.avatar} />
      <AvatarFallback>
        {currentContext?.name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
```

### 2. Navigation State Management

#### Organization Context Hook

```typescript
// File: src/hooks/use-organization-context.ts

interface UseOrganizationContextReturn {
  activeContext: 'personal' | 'organization';
  activeOrganization?: OrganizationContext;
  switchToPersonal: () => Promise<void>;
  switchToOrganization: (orgId: string) => Promise<void>;
  canSwitchTo: (orgId: string) => boolean;
}

export function useOrganizationContext(): UseOrganizationContextReturn {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();

  // Switch context mutations
  const switchContextMutation = useMutation({
    mutationFn: async ({ orgId }: { orgId?: string }) => {
      return await updateUserSession({ activeOrganizationId: orgId });
    },
    onSuccess: () => {
      // Invalidate user queries to refresh context
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Invalidate permission-dependent queries
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  return {
    activeContext: user.activeOrganizationId ? 'organization' : 'personal',
    activeOrganization: user.activeOrganization,
    switchToPersonal: () =>
      switchContextMutation.mutateAsync({ orgId: undefined }),
    switchToOrganization: (orgId: string) =>
      switchContextMutation.mutateAsync({ orgId }),
    canSwitchTo: (orgId: string) =>
      user.organizations?.some((org) => org.id === orgId) ?? false,
  };
}
```

### 3. Navigation Components

#### AuthenticatedNav Component

```typescript
// File: src/components/layouts/authenticated-nav.tsx

export function AuthenticatedNav() {
  const { user } = Route.useRouteContext();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl">
            Platform Name
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavigationLink to="/feed" icon={HomeIcon}>
              Feed
            </NavigationLink>
            <NavigationLink to="/explore" icon={CompassIcon}>
              Explore
            </NavigationLink>
            <NavigationLink to="/search" icon={SearchIcon}>
              Search
            </NavigationLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/write">
              <Button>
                <PenIcon className="h-4 w-4 mr-2" />
                Write
              </Button>
            </Link>
            <UserContextDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
```

#### PublicNav Component

```typescript
// File: src/components/layouts/public-nav.tsx

export function PublicNav() {
  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl">
            Platform Name
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="hover:text-primary">
              Explore
            </Link>
            <Link to="/search" className="hover:text-primary">
              <SearchIcon className="h-4 w-4 mr-1 inline" />
              Search
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
```

#### MobileBottomNav Component

```typescript
// File: src/components/layouts/mobile-bottom-nav.tsx

export function MobileBottomNav() {
  const { user } = Route.useRouteContext();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { to: '/feed', icon: HomeIcon, label: 'Feed' },
    { to: '/explore', icon: CompassIcon, label: 'Explore' },
    { to: '/write', icon: PlusIcon, label: 'Write' },
    { to: '/search', icon: SearchIcon, label: 'Search' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center p-2 ${
              location.pathname === item.to ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}

        {/* Avatar as 5th tab */}
        <UserContextDropdown />
      </div>
    </nav>
  );
}
```

## Database Schema Updates

### User Session Enhancement

```sql
-- Update sessions table to track active organization
ALTER TABLE sessions
ADD COLUMN active_organization_id TEXT REFERENCES organizations(id);

-- Index for performance
CREATE INDEX idx_sessions_active_org ON sessions(active_organization_id);
```

### Organization Membership Context

```sql
-- Add display preferences for organization switching
ALTER TABLE members
ADD COLUMN display_name TEXT, -- Custom display name in org context
ADD COLUMN joined_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN last_active TIMESTAMP;

-- Index for org switching queries
CREATE INDEX idx_members_user_active ON members(user_id, last_active DESC);
```

## API Specifications

### Session Context Update Endpoint

```typescript
// File: src/modules/auth/api/update-session-context.ts

export const updateSessionContext = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      activeOrganizationId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error('Not authenticated');

    // Validate organization membership if switching to org
    if (data.activeOrganizationId) {
      const membership = await getUserMembership({
        userId: session.user.id,
        organizationId: data.activeOrganizationId,
      });

      if (!membership.length) {
        throw new Error('Not a member of this organization');
      }
    }

    // Update session with new active organization
    await db
      .update(sessions)
      .set({
        activeOrganizationId: data.activeOrganizationId,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, session.session.id));

    return { success: true };
  });
```

### User Context Query

```typescript
// File: src/modules/auth/hooks/use-user-context.ts

export const userContextQueries = {
  current: () =>
    queryOptions({
      queryKey: ['user', 'context'] as const,
      queryFn: async () => {
        const user = await getUser();
        if (!user) return null;

        // Fetch user's organizations with roles
        const organizations = await getUserOrganizations({ userId: user.id });

        return {
          ...user,
          organizations,
          activeOrganization: organizations.find(
            (org) => org.id === user.activeOrganizationId,
          ),
        };
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
};

export function useUserContext() {
  return useSuspenseQuery(userContextQueries.current());
}
```

## Permission Integration

### Context-Aware Permission Checks

```typescript
// File: src/lib/auth/context-permissions.ts

export function getContextPermissions(user: UserWithPermissions): Permission[] {
  if (!user.activeOrganizationId) {
    // Personal context - only system role permissions
    return computePermissions(user.role, null);
  }

  // Organization context - combine system + org permissions
  const orgMembership = user.organizations?.find(
    (org) => org.id === user.activeOrganizationId,
  );

  return computePermissions(user.role, orgMembership?.role);
}

export function hasContextPermission(
  user: UserWithPermissions,
  permission: Permission,
): boolean {
  const contextPermissions = getContextPermissions(user);
  return contextPermissions.includes(permission);
}
```

## Performance Considerations

### Query Optimization

```typescript
// Batch organization data fetching
export async function getUserOrganizationsWithContext(userId: string) {
  return await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      avatar: organizations.avatar,
      role: members.role,
      joinedAt: members.createdAt,
      memberCount: sql<number>`(
        SELECT COUNT(*) FROM ${members} 
        WHERE ${members.organizationId} = ${organizations.id}
      )`,
      postCount: sql<number>`(
        SELECT COUNT(*) FROM posts 
        WHERE posts.organization_id = ${organizations.id}
      )`,
    })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(eq(members.userId, userId));
}
```

### Caching Strategy

```typescript
// React Query cache configuration for context switching
export const contextQueryConfig = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};
```

## Testing Specifications

### Unit Tests

```typescript
// Test organization context switching
describe('useOrganizationContext', () => {
  it('should switch to personal context', async () => {
    const { result } = renderHook(() => useOrganizationContext());

    await act(async () => {
      await result.current.switchToPersonal();
    });

    expect(result.current.activeContext).toBe('personal');
  });

  it('should validate organization membership before switching', async () => {
    const { result } = renderHook(() => useOrganizationContext());

    await expect(
      result.current.switchToOrganization('invalid-org-id'),
    ).rejects.toThrow('Not a member');
  });
});
```

### Integration Tests

```typescript
// Test navigation state persistence
describe('Navigation Context Persistence', () => {
  it('should persist organization context across page refreshes', async () => {
    // Test session storage of active organization
    // Verify context restoration on app reload
  });
});
```

## Migration Strategy

### Phase 1: Core Infrastructure

1. Update database schemas
2. Create context management hooks
3. Build avatar dropdown component

### Phase 2: Navigation Integration

1. Update navigation components
2. Implement context switching
3. Add mobile navigation

### Phase 3: Permission Integration

1. Update permission checks to use context
2. Test organization switching workflows
3. Validate security boundaries

This technical specification provides the detailed implementation guidance needed to build the unified navigation system that leverages our existing permission infrastructure.
