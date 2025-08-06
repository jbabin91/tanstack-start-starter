# UX Architecture & Navigation Design Specification

## Overview

This document defines the user experience architecture for our Medium-like blogging platform with organizational publishing capabilities. The design supports three distinct user experiences: Public (logged out), Authenticated (logged in), and Admin/Moderated users.

## Core Design Principles

### 1. Content-First Design

- Writing and reading experience is paramount
- Clean, distraction-free interfaces
- Typography and readability optimized for long-form content

### 2. Progressive Disclosure

- Features revealed based on user permissions and context
- Navigation adapts to user capabilities
- Admin features only appear when user has appropriate permissions

### 3. Context-Aware Experience

- Single avatar dropdown consolidates user/organization switching
- Navigation changes based on active context (personal vs organization)
- Permissions drive available actions and features

## User Experience States

### Public Experience (Logged Out)

**Target Users:** Potential users discovering content, readers without accounts

**Navigation Structure:**

```text
Logo | Explore | Search 🔍 | Sign In | Sign Up
```

**Key Features:**

- Landing page with value proposition and featured content
- Public content discovery through /explore
- Universal search without personalization
- Organization profiles discoverable through content
- Clear sign-up CTAs throughout experience

**Route Access:**

- `/` - Landing page
- `/explore` - Public content discovery
- `/search` - Universal search
- `/@username` - Public user profiles
- `/organizations/[slug]` - Public organization profiles
- `/posts/[id]` - Individual posts (public only)

### Authenticated Experience (Logged In)

**Target Users:** Content creators, organization members, regular platform users

**Navigation Structure:**

```text
Logo | Feed | Explore | Search 🔍 | Write | [ContextAvatar ▼]
```

**Key Features:**

- Personalized feed based on follows and interests
- Content creation and management tools
- Organization context switching
- Enhanced search with personal history
- Dashboard for content management

**Route Access:**

- All public routes plus:
- `/feed` - Personalized content feed
- `/write` - Content creation interface
- `/dashboard/*` - Content management
- `/draft/[id]` - Draft editing
- Organization-specific features based on membership

### Admin Experience (Permission-Based)

**Target Users:** Platform administrators, content moderators

**Enhanced Features:**

- Content moderation tools
- User management interfaces
- System analytics and monitoring
- Appeal review systems
- All regular user features plus administrative capabilities

**Additional Routes:**

- `/admin/*` - Administrative interfaces
- Admin features progressively disclosed in navigation based on permissions

## Navigation Architecture

### Unified Avatar Dropdown Design

The core innovation of our navigation is the unified avatar dropdown that consolidates:

- Current context display (personal vs organization)
- Organization switching
- Quick actions
- Account management
- Admin features (permission-based)

#### Dropdown Menu Structure:

```typescript
// Current Context Header
User/Organization Avatar + Name + Context Type

// Organization Switcher Section
- Personal (User Name)
- Organization 1
- Organization 2
- ... (with active context indicated)

// Quick Actions
- Dashboard (⌘D)
- My Posts
- New Post (⌘N)
- Manage [Organization] (if org context + permissions)

// Account Management
- Profile & Account
- Settings

// Admin Section (permission-based)
- Content Moderation
- User Management

// Sign Out
```

### Context-Aware Avatar Display

- **Personal Mode:** Shows user's personal avatar
- **Organization Mode:** Shows organization logo/avatar
- Visual indicator makes current context immediately clear

### Mobile Navigation Strategy

**Bottom Navigation for Authenticated Users:**

```text
[Feed] [Explore] [Write] [Search] [Avatar]
```

**Responsive Patterns:**

- Desktop: Full horizontal navigation
- Tablet: Collapsed navigation with hamburger
- Mobile: Bottom tab navigation for core actions

## Information Architecture

### Route Structure

```text
/ (landing page - marketing)
├── /explore (public content discovery)
├── /search (universal search)
├── /feed (personalized feed - auth required)
├── /write (content creation - auth required)
├── /dashboard/* (content management - auth required)
│   ├── /dashboard/posts (my posts)
│   ├── /dashboard/drafts (draft management)
│   ├── /dashboard/analytics (performance metrics)
│   └── /dashboard/organization (org-specific management)
├── /@username (public user profiles)
│   └── /@username/[slug] (individual posts)
├── /organizations/[slug] (org profiles)
│   └── /organizations/[slug]/[slug] (org posts)
├── /admin/* (admin interfaces - permission required)
│   ├── /admin/content (moderation)
│   ├── /admin/users (user management)
│   └── /admin/appeals (appeal reviews)
└── /draft/[id] (draft editing - auth required)
```

### User Flow Patterns

#### Discovery Flow (Public):

```text
Landing (/) → Explore (/explore) → Post → Author Profile → Sign Up CTA
```

#### Content Creation Flow (Authenticated):

```text
Write Button → Organization Context Selection → Draft → Preview → Publish → Analytics
```

#### Organization Discovery Flow:

```text
Content → "Published by [Org]" → Org Profile → Join/Request → Member Experience
```

## Search vs Explore Strategy

### Explore (/explore) - Curated Discovery

**Purpose:** Help users discover quality content through curation

**Features:**

- Editorial/algorithmic content curation
- Trending topics and posts
- Topic-based browsing tabs
- Featured organizations (through content)
- No direct search - guides to /search

**Content Organization:**

- Trending tab (algorithmic)
- Recent tab (chronological)
- Topics tab (category-based)
- Organizations tab (discovery through published content)

### Search (/search) - Intentional Discovery

**Purpose:** Help users find specific content, people, or organizations

**Features:**

- Universal search across posts, people, organizations
- Advanced filtering and sorting
- Search history for authenticated users
- Auto-complete and suggestions
- Scoped search within results

**Search Interface:**

- Primary search input with universal scope
- Filter tabs: All | Posts | People | Organizations | Tags
- Sort options: Relevance | Latest | Popular
- Advanced filters: Date range, content type, author

## Component Architecture

### Core Navigation Components

1. `PublicNav` - Public user navigation
2. `AuthenticatedNav` - Authenticated user navigation
3. `UserContextDropdown` - Unified avatar dropdown
4. `MobileBottomNav` - Mobile bottom navigation
5. `OrganizationSwitcher` - Context switching logic

### Layout Components

1. `AppLayout` - Main application wrapper
2. `SidebarLayout` - Dashboard and authenticated pages
3. `ContentLayout` - Reading and content-focused pages
4. `AdminLayout` - Administrative interface wrapper

### Content Components

1. `PostCard` - Content display card
2. `UserCard` - User profile display
3. `OrganizationCard` - Organization profile display
4. `SearchResults` - Search result display
5. `FeedItem` - Personalized feed content

## Accessibility & WCAG Compliance

### Semantic Structure

- Proper landmark roles (navigation, main, complementary)
- Hierarchical heading structure (h1 → h6)
- Descriptive link text and button labels
- Form labels and input descriptions

### Keyboard Navigation

- Tab order follows logical page flow
- Skip links for main content
- Keyboard shortcuts for common actions (⌘K for search, ⌘N for new post)
- Focus indicators for all interactive elements

### Screen Reader Support

- ARIA attributes for dynamic content
- Status announcements for context changes
- Descriptive alternative text for images
- Proper table headers and captions

### Visual Accessibility

- High contrast ratios (WCAG AA compliance)
- Scalable text up to 200% zoom
- Color-blind friendly palette
- Motion preferences respected

## Mobile-First Considerations

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Touch-Friendly Design

- Minimum 44px touch targets
- Gesture-based navigation
- Thumb-friendly bottom navigation
- Swipe actions for common tasks

### Performance Optimizations

- Lazy loading for images and content
- Progressive web app capabilities
- Offline reading support
- Optimized images for different screen densities

## Implementation Priority

### Phase 1: Core Navigation (Week 1)

1. Update existing nav-bar.tsx component
2. Implement UserContextDropdown
3. Create responsive navigation patterns
4. Add mobile bottom navigation

### Phase 2: Layout System (Week 1)

1. Create layout component architecture
2. Implement responsive grid systems
3. Add sidebar and content layouts
4. Ensure accessibility compliance

### Phase 3: Route Structure (Week 2)

1. Update route definitions
2. Implement landing page redesign
3. Create explore and search pages
4. Add dashboard routing structure

This navigation and UX architecture provides a solid foundation that leverages our existing permission system while creating intuitive, accessible experiences for all user types.
