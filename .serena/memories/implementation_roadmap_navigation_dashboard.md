# Implementation Roadmap - Navigation & Dashboard System

## Overview

Detailed implementation roadmap for transforming our current basic dashboard into a sophisticated, role-based content management platform with unified navigation and context-aware experiences.

## Current State Assessment

### ✅ What We Have

- **Authentication System**: Complete with better-auth, multi-session support
- **Permission System**: Working RBAC with system roles and organization roles
- **Database Schema**: Role enums, organization structure, user membership
- **Basic Components**: shadcn/ui library, responsive layouts
- **Route Structure**: File-based routing with protected/public separation

### 🔄 What Needs Transformation

- **Navigation**: Basic nav-bar.tsx → Context-aware navigation system
- **Dashboard**: Static account dashboard → Role-based content management
- **User Experience**: Single-mode → Multi-context (personal/organization)
- **Content Management**: Basic → Full creation, editing, publishing workflow

## Phase 1: Navigation Foundation (Week 1)

### Priority 1A: Core Navigation Components (Days 1-2)

**Goal**: Replace existing navigation with context-aware system

#### Tasks:

1. **Update nav-bar.tsx Component**
   - Replace current navigation with new AuthenticatedNav/PublicNav
   - Implement conditional rendering based on user state
   - Add responsive breakpoints and mobile considerations

2. **Create UserContextDropdown Component**
   - Build unified avatar dropdown as specified
   - Implement organization switching logic
   - Add quick actions and admin menu (permission-based)
   - Include keyboard shortcuts and accessibility features

3. **Add ContextAvatar Component**
   - Avatar that shows current context (personal vs org)
   - Dynamic display based on active organization
   - Support multiple sizes for different usage contexts

4. **Create Mobile Navigation**
   - Bottom tab navigation for authenticated users
   - Responsive design that adapts to screen size
   - Touch-friendly interaction patterns

**Files to Create/Update:**

```text
src/components/navigation/
├── user-context-dropdown.tsx (new)
├── context-avatar.tsx (new)
├── authenticated-nav.tsx (new)
├── public-nav.tsx (new)
└── mobile-bottom-nav.tsx (new)

src/components/layouts/
├── nav-bar.tsx (update - make context-aware)
└── app-layout.tsx (update - integrate new navigation)
```

**Acceptance Criteria:**

- [ ] Navigation adapts to user state (public/authenticated/admin)
- [ ] Avatar dropdown shows current context clearly
- [ ] Organization switching works without page refresh
- [ ] Mobile navigation provides all core functionality
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Priority 1B: Context Management System (Days 3-4)

**Goal**: Build organization context switching infrastructure

#### Tasks:

1. **Create Organization Context Hook**
   - useOrganizationContext hook for state management
   - Mutation hooks for context switching
   - Integration with TanStack Query for caching

2. **Update Session Management**
   - Extend session storage to include active organization
   - Server-side context switching endpoint
   - Session persistence across browser refreshes

3. **Update Permission System Integration**
   - Ensure permissions update when context switches
   - Context-aware permission checking functions
   - Route-level permission validation

4. **Add Context Indicators**
   - Visual indicators of current context throughout app
   - Breadcrumbs that show organization context
   - Page titles that reflect active context

**Files to Create/Update:**

```text
src/hooks/
└── use-organization-context.ts (new)

src/modules/auth/api/
└── update-session-context.ts (new)

src/lib/auth/
├── context-permissions.ts (new)
└── types.ts (update - add organization context types)

Database:
└── Migration: Add active_organization_id to sessions table
```

**Acceptance Criteria:**

- [ ] Users can switch between personal and organization contexts
- [ ] Context persists across page refreshes and browser sessions
- [ ] Permissions update correctly when context changes
- [ ] All context switches are validated (membership checks)
- [ ] Performance is optimized (minimal re-renders, efficient queries)

### Priority 1C: Route Structure Updates (Days 5-7)

**Goal**: Implement new route structure with proper layouts

#### Tasks:

1. **Create New Route Structure**
   - Implement planned route hierarchy
   - Add proper route guards and permission checks
   - Create landing page, explore, search placeholder routes

2. **Update Layout System**
   - Create different layouts for different page types
   - Implement sidebar layouts for dashboard pages
   - Add content-focused layouts for reading experiences

3. **Add Route Context Integration**
   - Ensure all routes receive proper user context
   - Implement permission-based route access
   - Add loading states and error boundaries

4. **Create Placeholder Pages**
   - Landing page with hero section and featured content
   - Explore page with content discovery patterns
   - Search page with universal search interface
   - Dashboard placeholder with proper layout

**Files to Create/Update:**

```text
src/routes/
├── index.tsx (update - new landing page)
├── explore.tsx (new)
├── search.tsx (new)
├── feed.tsx (new)
└── _app/dashboard/
    ├── index.tsx (update - role-based dashboard)
    ├── posts.tsx (new)
    ├── drafts.tsx (new)
    └── analytics.tsx (new)

src/components/layouts/
├── app-layout.tsx (update)
├── dashboard-layout.tsx (new)
├── content-layout.tsx (new)
└── admin-layout.tsx (new)
```

**Acceptance Criteria:**

- [ ] All new routes render correctly with proper layouts
- [ ] Permission-based access works for protected routes
- [ ] Landing page showcases platform value proposition
- [ ] Dashboard layout supports role-based content
- [ ] Mobile responsiveness across all new pages

## Phase 2: Dashboard Transformation (Week 2)

### Priority 2A: Dashboard Architecture (Days 1-2)

**Goal**: Transform static dashboard into dynamic, role-based interface

#### Tasks:

1. **Analyze Current Dashboard**
   - Review existing account-dashboard.tsx
   - Identify reusable components and patterns
   - Plan component hierarchy for role-based rendering

2. **Create Dashboard Component System**
   - Build modular dashboard widgets
   - Implement role-based widget selection
   - Add empty states and onboarding flows

3. **Design Dashboard Layouts**
   - Create responsive grid system for widgets
   - Implement sidebar navigation for dashboard sections
   - Add breadcrumb navigation and page headers

**Files to Analyze/Update:**

```text
src/routes/_app/account-dashboard.tsx (analyze and refactor)
src/components/dashboard/ (new directory structure)
├── widgets/
│   ├── posts-overview.tsx
│   ├── analytics-summary.tsx
│   ├── organization-stats.tsx
│   └── admin-alerts.tsx
├── layouts/
│   ├── dashboard-grid.tsx
│   └── dashboard-sidebar.tsx
└── shared/
    ├── empty-states.tsx
    └── loading-skeletons.tsx
```

### Priority 2B: Content Management Interface (Days 3-5)

**Goal**: Build post management interface with drafts, publishing, analytics

#### Tasks:

1. **Posts Dashboard**
   - List view of all user posts with status indicators
   - Filtering and sorting (published, draft, private, org-only)
   - Bulk actions and post management
   - Quick edit and delete actions

2. **Drafts Management**
   - Draft listing with auto-save indicators
   - Resume editing functionality
   - Draft sharing for organization review
   - Draft conversion to published posts

3. **Analytics Interface**
   - Post performance metrics
   - Engagement statistics
   - Organization post analytics (when in org context)
   - Export and reporting features

4. **Context-Aware Content**
   - Show different content based on active context
   - Organization post management (when user has permissions)
   - Personal vs organization content separation

**Files to Create:**

```text
src/modules/posts/ (new module)
├── components/
│   ├── posts-table.tsx
│   ├── post-card.tsx
│   ├── post-actions.tsx
│   └── analytics-charts.tsx
├── api/
│   ├── get-user-posts.ts
│   ├── get-post-analytics.ts
│   └── update-post-status.ts
└── hooks/
    ├── use-posts-query.ts
    └── use-post-mutations.ts
```

### Priority 2C: Organization Features (Days 6-7)

**Goal**: Add organization-specific dashboard features

#### Tasks:

1. **Organization Dashboard Widgets**
   - Team member activity summary
   - Organization post performance
   - Member management shortcuts (for admins)
   - Organization settings access

2. **Member Management Interface**
   - List organization members with roles
   - Invite new members workflow
   - Role assignment and permissions
   - Member activity monitoring

3. **Organization Settings**
   - Organization profile management
   - Publishing guidelines and workflow
   - Member role definitions
   - Organization branding and customization

**Acceptance Criteria:**

- [ ] Dashboard shows different content based on user role
- [ ] Organization context switching updates dashboard content
- [ ] Post management works for both personal and organization content
- [ ] Analytics show appropriate data based on permissions
- [ ] Empty states guide users to relevant actions

## Phase 3: Content Creation & Search (Week 3-4)

### Priority 3A: Content Creation Interface

**Goal**: Build writing and editing interface

#### Tasks:

1. **Write Page (/write)**
   - Rich text editor with markdown support
   - Organization context selection for new posts
   - Auto-save and draft management
   - Preview functionality

2. **Draft Editing System**
   - Resume editing from dashboard
   - Version history and recovery
   - Collaborative editing (for organizations)
   - Publishing workflow with approvals

### Priority 3B: Search & Discovery

**Goal**: Implement search and explore pages

#### Tasks:

1. **Search Page (/search)**
   - Universal search across posts, users, organizations
   - Advanced filtering and sorting
   - Search history and suggestions
   - Scoped search within results

2. **Explore Page (/explore)**
   - Curated content discovery
   - Trending topics and posts
   - Featured organizations through content
   - Topic-based browsing

## Phase 4: Admin & Moderation (Week 5-6)

### Priority 4A: Content Moderation

**Goal**: Build admin interfaces for content management

#### Tasks:

1. **Admin Dashboard**
   - System overview and health metrics
   - Content moderation queue
   - User management interfaces
   - Appeal review system

2. **Moderation Tools**
   - Flag and review workflows
   - Bulk moderation actions
   - Automated moderation rules
   - Appeal and resolution tracking

### Priority 4B: User Management

**Goal**: Complete admin user management features

#### Tasks:

1. **User Directory**
   - Searchable user listing
   - User profile management
   - Role assignment workflows
   - Account status management

## Implementation Dependencies

### Technical Dependencies

```text
Shadcn/ui components needed:
- navigation-menu (navigation system)
- dropdown-menu (avatar dropdown)
- command (search interface)
- tabs (content organization)
- select (organization switching)
- avatar, badge, card (display components)
- sheet, dialog (mobile and modals)
- skeleton (loading states)
```

### Database Dependencies

```sql
-- Session context tracking
ALTER TABLE sessions ADD COLUMN active_organization_id TEXT;

-- Member display preferences
ALTER TABLE members ADD COLUMN display_name TEXT;
ALTER TABLE members ADD COLUMN last_active TIMESTAMP;

-- Post management
CREATE TABLE post_analytics (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Dependencies

- Session context update endpoint
- Organization switching validation
- User posts with context filtering
- Post analytics aggregation
- Search indexing system

## Risk Mitigation

### Technical Risks

1. **Context Switching Performance**: Implement proper caching and query optimization
2. **Permission Validation**: Ensure all context switches validate membership and permissions
3. **Mobile Responsiveness**: Test extensively on different screen sizes and devices
4. **Accessibility**: Regular audit with screen readers and accessibility tools

### User Experience Risks

1. **Context Confusion**: Clear visual indicators and consistent terminology
2. **Navigation Complexity**: Progressive disclosure and intuitive organization
3. **Performance**: Optimize bundle size and loading times
4. **Empty States**: Comprehensive onboarding and guidance

## Success Metrics

### Phase 1 Success Criteria

- [ ] Navigation system deployed without breaking changes
- [ ] Context switching works reliably for all users
- [ ] Mobile navigation provides full functionality
- [ ] Performance baseline maintained or improved

### Phase 2 Success Criteria

- [ ] Dashboard shows role-appropriate content
- [ ] Content management workflows are intuitive
- [ ] Organization features work for multi-org users
- [ ] Analytics provide actionable insights

### Overall Success Criteria

- [ ] User engagement increases with new navigation
- [ ] Content creation workflow is streamlined
- [ ] Organization adoption grows with better tools
- [ ] Admin efficiency improves with proper tools
- [ ] Zero security issues with permission system

This roadmap provides a structured approach to transforming our application into a sophisticated content management platform while maintaining the stability and security of our existing systems.
