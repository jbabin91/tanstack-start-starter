# Search & Discovery Implementation Roadmap

## Overview

This document provides a detailed, phase-by-phase implementation roadmap for building the search and discovery system on our TanStack Start blogging platform. The roadmap prioritizes PostgreSQL optimization, advanced filtering capabilities, and progressive feature rollout.

**Related Documentation:**

- **[Search UX Design](./search_ux_design.md)** - User experience design strategy and interface specifications
- **[Search API Implementation](../../docs/api/search.md)** - Complete server function implementations
- **[Database Architecture](../../docs/architecture/database.md)** - PostgreSQL schema and performance optimization
- **[Component Patterns](../../docs/development/component-patterns.md)** - Search component architecture and hooks
- **[Content Creation System](./content_creation_writing_interface_design.md)** - Content authoring system that feeds search

## Strategic Implementation Principles

### 1. PostgreSQL-First Optimization

- Leverage PostgreSQL native full-text search capabilities
- Implement proper indexing from day one
- Use materialized views for performance-critical queries
- Optimize connection pools for read-heavy search workloads

### 2. Progressive Feature Delivery

- Phase 1: Core search functionality
- Phase 2: Advanced filtering system
- Phase 3: Discovery interface and curation
- Phase 4: Analytics and performance optimization

### 3. Performance-Conscious Development

- Real-time search with proper debouncing
- Efficient caching strategies with TanStack Query
- Mobile-first responsive implementation
- Comprehensive performance monitoring

### 4. Analytics-Driven Enhancement

- User behavior tracking from day one
- Search performance monitoring with Sentry
- Content gap analysis through zero-result queries
- Continuous optimization based on usage patterns

## Phase 1: Foundation & Core Search (Weeks 1-2)

### Week 1: Database Foundation & Basic API

**Priority 1A: Database Schema Extensions (Days 1-2)**

```sql
-- Essential extensions and indexes for search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Core search indexes
CREATE INDEX CONCURRENTLY posts_search_vector_gin_idx
  ON posts USING gin(to_tsvector('english', title || ' ' || content));

CREATE INDEX CONCURRENTLY posts_title_trgm_idx
  ON posts USING gin(title gin_trgm_ops);

-- Search analytics table
CREATE TABLE search_queries (
  -- Complete schema from database.md
);

-- Categories and tags for filtering
CREATE TABLE categories (
  -- Schema optimized for search facets
);
```

**Tasks:**

- [ ] Implement search-optimized database extensions
- [ ] Create search analytics table for performance monitoring
- [ ] Add categories table for content organization
- [ ] Set up proper indexing strategy for full-text search
- [ ] Create database migration scripts

**Acceptance Criteria:**

- All indexes created without blocking production
- Search queries execute in <200ms for 95th percentile
- Analytics tracking captures search performance data
- Database supports concurrent search operations

**Priority 1B: Basic Search API (Days 3-4)**

```typescript
// Core search server functions
export const searchPosts = createServerFn({ method: 'GET' })
  .validator(SearchPostsInputSchema)
  .handler(async ({ query, organizationId, limit = 20, offset = 0 }) => {
    // PostgreSQL full-text search with ranking
    const results = await db.execute(sql`
      SELECT 
        p.*,
        u.name as author_name,
        o.name as organization_name,
        ts_rank(to_tsvector('english', p.title || ' ' || p.content),
                plainto_tsquery('english', ${query})) as rank,
        ts_headline('english', p.content, 
                   plainto_tsquery('english', ${query}), 
                   'MaxWords=30') as excerpt
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN organizations o ON p.organization_id = o.id
      WHERE p.status = 'published'
        AND to_tsvector('english', p.title || ' ' || p.content) 
            @@ plainto_tsquery('english', ${query})
        ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
      ORDER BY rank DESC, p.published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Track search analytics
    await trackSearchQuery({ query, resultCount: results.length });

    return { posts: results, total: results.length };
  });
```

**Tasks:**

- [ ] Implement `searchPosts` server function with PostgreSQL full-text search
- [ ] Create `searchUsers` and `searchOrganizations` functions
- [ ] Build `globalSearch` function for universal search
- [ ] Implement basic search analytics tracking
- [ ] Set up TanStack Query integration patterns

**Acceptance Criteria:**

- Search returns relevant results ranked by PostgreSQL ts_rank
- Search analytics capture query performance and user behavior
- API handles edge cases (empty query, no results, errors)
- Query integration follows TkDodo hierarchical patterns

### Week 2: Basic Search Interface

**Priority 1C: Search Page Foundation (Days 1-3)**

```typescript
// Main search interface route
// src/routes/search.tsx
export const Route = createFileRoute('/search')({
  component: SearchPage,
  validateSearch: z.object({
    q: z.string().optional(),
    type: z.enum(['all', 'posts', 'users', 'organizations']).default('all'),
  }),
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const {
    query,
    results,
    isLoading,
    updateQuery,
    trackSearch,
  } = useRealtimeSearch({
    initialQuery: search.q || '',
    contentType: search.type,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchInput
        value={query}
        onChange={updateQuery}
        placeholder="Search posts, people, and organizations..."
      />

      <SearchFilters
        contentType={search.type}
        onTypeChange={(type) => navigate({ search: { q: query, type } })}
      />

      <SearchResults
        results={results}
        isLoading={isLoading}
        onResultClick={trackSearch}
      />
    </div>
  );
}
```

**Tasks:**

- [ ] Create `/search` route with URL state management
- [ ] Build search input component with real-time suggestions
- [ ] Implement basic content type filtering (All/Posts/People/Organizations)
- [ ] Create search result components for each content type
- [ ] Add loading states and empty state handling

**Acceptance Criteria:**

- Search page renders with proper URL state synchronization
- Real-time search works with 300ms debouncing
- Results display with proper content type indicators
- Mobile-responsive search interface works correctly

**Priority 1D: Real-time Search Hook (Days 4-5)**

```typescript
// src/modules/search/hooks/use-realtime-search.ts
export function useRealtimeSearch(
  initialFilters: SearchFilters = {},
  options: UseRealtimeSearchOptions = {},
) {
  const { debounceMs = 300, minQueryLength = 2, enabled = true } = options;

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);
  const [isTyping, setIsTyping] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setIsTyping(false);
    }, debounceMs);

    setIsTyping(true);
    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  // Search query with proper caching
  const searchQuery = useQuery({
    ...searchQueries.global(debouncedFilters),
    enabled: enabled && debouncedFilters.query?.length >= minQueryLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const trackSearch = useCallback(
    (result: SearchResult, position: number) => {
      // PostHog analytics integration
      trackSearchResultClick(result, position, debouncedFilters.query);
    },
    [debouncedFilters.query],
  );

  return {
    query: filters.query || '',
    results: searchQuery.data?.results || [],
    isLoading: searchQuery.isLoading || isTyping,
    updateQuery: (query: string) => setFilters((prev) => ({ ...prev, query })),
    trackSearch,
  };
}
```

**Tasks:**

- [ ] Implement debounced real-time search hook
- [ ] Create search analytics tracking hooks
- [ ] Build search query patterns with TanStack Query
- [ ] Add search result click tracking
- [ ] Implement search state persistence

**Acceptance Criteria:**

- Search debouncing prevents excessive API calls
- Analytics track search performance and user behavior
- Search state persists across navigation
- Mobile search performance is optimized

## Phase 2: Advanced Filtering System (Weeks 3-4)

### Week 3: Filter Architecture & Components

**Priority 2A: Dynamic Filter Configuration (Days 1-2)**

```typescript
// src/modules/search/config/filter-config.ts
export const searchFilterConfig: Record<string, FilterGroup[]> = {
  posts: [
    {
      id: 'content-type',
      label: 'Content',
      collapsible: false,
      defaultExpanded: true,
      filters: [
        {
          id: 'content-type',
          label: 'Content Type',
          type: 'multi-select',
          options: [
            { value: 'posts', label: 'Posts', icon: 'FileText' },
            { value: 'users', label: 'People', icon: 'Users' },
            {
              value: 'organizations',
              label: 'Organizations',
              icon: 'Building',
            },
          ],
        },
      ],
    },
    {
      id: 'temporal',
      label: 'Date & Time',
      collapsible: true,
      defaultExpanded: false,
      filters: [
        {
          id: 'date-range',
          label: 'Published Date',
          type: 'date-range',
          category: 'temporal',
        },
        {
          id: 'date-preset',
          label: 'Quick Date Filter',
          type: 'select',
          options: [
            { value: 'any', label: 'Any time' },
            { value: 'week', label: 'Past week' },
            { value: 'month', label: 'Past month' },
            { value: 'year', label: 'Past year' },
          ],
        },
      ],
    },
    // Additional filter groups for metadata, engagement, etc.
  ],
};
```

**Tasks:**

- [ ] Design flexible filter configuration system
- [ ] Create filter type definitions and validation schemas
- [ ] Build filter option providers (dynamic categories, tags)
- [ ] Implement filter conflict resolution logic
- [ ] Create filter preset management

**Acceptance Criteria:**

- Filter configuration supports all planned filter types
- Dynamic options load efficiently from database
- Filter conflicts are handled gracefully
- Configuration is type-safe and extensible

**Priority 2B: Filter UI Components (Days 3-4)**

```typescript
// src/components/search/filters/filter-panel.tsx
function FilterPanel({ contentType, onFiltersChange, className }: FilterPanelProps) {
  const {
    filterConfig,
    activeFilterCount,
    hasActiveFilters,
    updateFilter,
    clearAllFilters,
    toSearchFilters,
  } = useSearchFilters(contentType);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters}>
              <Icons.x className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {filterConfig.map(group => (
          <FilterGroup
            key={group.id}
            group={group}
            onFilterChange={updateFilter}
          />
        ))}
      </CardContent>
    </Card>
  );
}
```

**Tasks:**

- [ ] Build collapsible filter panel component
- [ ] Create individual filter input components (date range, multi-select, numeric)
- [ ] Implement filter badge system with clear actions
- [ ] Build mobile-optimized filter bottom sheet
- [ ] Add filter state persistence to localStorage

**Acceptance Criteria:**

- Filter panel is responsive and touch-friendly
- All filter types work correctly with proper validation
- Filter state persists across sessions
- Mobile filter experience rivals desktop functionality

### Week 4: Filter Integration & Advanced Search

**Priority 2C: Search Integration (Days 1-2)**

```typescript
// Enhanced search API with comprehensive filtering
export const searchPostsAdvanced = createServerFn({ method: 'GET' })
  .validator(AdvancedSearchSchema)
  .handler(
    async ({
      query,
      contentType = ['posts'],
      categories,
      tags,
      dateRange,
      readingTime,
      organizationId,
      authorId,
      minLikes,
      minViews,
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
    }) => {
      // Build dynamic WHERE conditions
      const whereConditions = [eq(posts.status, 'published')];

      if (query) {
        whereConditions.push(
          sql`to_tsvector('english', ${posts.title} || ' ' || ${posts.content}) 
            @@ plainto_tsquery('english', ${query})`,
        );
      }

      // Category filtering with join
      if (categories?.length) {
        const categoryPosts = await db
          .select({ postId: postCategories.postId })
          .from(postCategories)
          .innerJoin(
            categoriesTable,
            eq(postCategories.categoryId, categoriesTable.id),
          )
          .where(inArray(categoriesTable.slug, categories));

        const postIds = categoryPosts.map((cp) => cp.postId);
        if (postIds.length > 0) {
          whereConditions.push(inArray(posts.id, postIds));
        } else {
          return { posts: [], total: 0 }; // No matching categories
        }
      }

      // Tag filtering with ALL tags requirement
      if (tags?.length) {
        const taggedPosts = await db
          .select({ postId: postTags.postId })
          .from(postTags)
          .where(inArray(postTags.tag, tags))
          .groupBy(postTags.postId)
          .having(sql`COUNT(DISTINCT ${postTags.tag}) = ${tags.length}`);

        const postIds = taggedPosts.map((tp) => tp.postId);
        if (postIds.length > 0) {
          whereConditions.push(inArray(posts.id, postIds));
        } else {
          return { posts: [], total: 0 }; // No matching tags
        }
      }

      // Additional filter conditions
      if (dateRange?.from) {
        whereConditions.push(gte(posts.publishedAt, new Date(dateRange.from)));
      }

      if (readingTime && readingTime.min) {
        whereConditions.push(gte(posts.readingTime, readingTime.min));
      }

      // Execute search with proper ranking and pagination
      const results = await db
        .select({
          // Post fields
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          readingTime: posts.readingTime,
          publishedAt: posts.publishedAt,

          // Author info
          authorName: users.name,
          authorUsername: users.username,

          // Organization info
          organizationName: organizations.name,

          // Search ranking
          rank: query
            ? sql<number>`ts_rank(to_tsvector('english', ${posts.title} || ' ' || ${posts.content}),
                            plainto_tsquery('english', ${query}))`
            : sql<number>`1`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .leftJoin(organizations, eq(posts.organizationId, organizations.id))
        .where(and(...whereConditions))
        .orderBy(
          sortBy === 'relevance'
            ? desc(sql`rank`)
            : sortBy === 'date'
              ? desc(posts.publishedAt)
              : desc(posts.publishedAt), // Default fallback
        )
        .limit(limit)
        .offset(offset);

      return { posts: results, total: results.length };
    },
  );
```

**Tasks:**

- [ ] Enhance search API with comprehensive filter support
- [ ] Implement efficient tag filtering with ALL/ANY options
- [ ] Add category filtering with proper joins
- [ ] Build date range and numeric range filtering
- [ ] Optimize query performance with proper indexing

**Acceptance Criteria:**

- All filter combinations work correctly
- Complex filter queries execute in <500ms
- Filter logic handles edge cases (no results, invalid ranges)
- Search relevance remains high with multiple filters

**Priority 2D: Filter State Management (Days 3-4)**

```typescript
// src/modules/search/hooks/use-search-filters.ts
export function useSearchFilters(contentType: string = 'posts') {
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const updateFilter = useCallback((filterId: string, value: FilterValue) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      // Handle empty values by removing filter
      if (
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete newFilters[filterId];
      } else {
        newFilters[filterId] = value;
      }

      // Update active count
      const activeCount = Object.keys(newFilters).filter((key) => {
        const filterValue = newFilters[key];
        return (
          filterValue !== undefined &&
          filterValue !== '' &&
          (!Array.isArray(filterValue) || filterValue.length > 0)
        );
      }).length;

      setActiveFilterCount(activeCount);

      return newFilters;
    });
  }, []);

  // Convert internal filter state to API-compatible format
  const toSearchFilters = useCallback(() => {
    const searchFilters: Record<string, unknown> = {};

    Object.entries(filters).forEach(([filterId, value]) => {
      switch (filterId) {
        case 'content-type':
          searchFilters.contentType = Array.isArray(value) ? value : [value];
          break;
        case 'categories':
          searchFilters.categories = Array.isArray(value) ? value : [value];
          break;
        case 'tags':
          searchFilters.tags = Array.isArray(value) ? value : [value];
          break;
        case 'date-range':
          if (typeof value === 'object' && value !== null && 'from' in value) {
            searchFilters.dateRange = value;
          }
          break;
        case 'reading-time':
          if (typeof value === 'string' && value !== 'any') {
            const [min, max] = value.split('-').map(Number);
            searchFilters.readingTime = {
              min,
              max: max === 999 ? undefined : max,
            };
          }
          break;
      }
    });

    return searchFilters;
  }, [filters]);

  return {
    filters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
    updateFilter,
    clearAllFilters: () => {
      setFilters({});
      setActiveFilterCount(0);
    },
    toSearchFilters,
  };
}
```

**Tasks:**

- [ ] Implement comprehensive filter state management
- [ ] Create filter value transformation utilities
- [ ] Build filter persistence with URL and localStorage
- [ ] Add filter conflict detection and resolution
- [ ] Implement filter analytics tracking

**Acceptance Criteria:**

- Filter state syncs correctly between URL and internal state
- Filter transformations handle all supported data types
- Filter persistence works across browser sessions
- Filter conflicts are resolved automatically

## Phase 3: Discovery Interface & Content Curation (Weeks 5-6)

### Week 5: Explore Page Foundation

**Priority 3A: Explore Route & Layout (Days 1-2)**

```typescript
// src/routes/explore.tsx
export const Route = createFileRoute('/explore')({
  component: ExplorePage,
  loader: async () => {
    // Preload trending content and categories
    const [featured, trending, categories, organizations] = await Promise.all([
      getFeaturedPosts(),
      getTrendingTopics(),
      getPopularCategories(),
      getActiveOrganizations(),
    ]);

    return { featured, trending, categories, organizations };
  },
});

function ExplorePage() {
  const { featured, trending, categories, organizations } = Route.useLoaderData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Content Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icons.star className="h-6 w-6 text-yellow-500" />
          Featured This Week
        </h2>
        <FeaturedContentCarousel posts={featured} />
      </section>

      {/* Trending Topics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icons.trendingUp className="h-6 w-6 text-green-500" />
          Trending Topics
        </h2>
        <TrendingTopicsGrid topics={trending} />
      </section>

      {/* Active Organizations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icons.building className="h-6 w-6 text-blue-500" />
          Active Organizations
        </h2>
        <OrganizationGrid organizations={organizations} />
      </section>

      {/* Browse by Category */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Icons.grid className="h-6 w-6 text-purple-500" />
          Browse by Category
        </h2>
        <CategoryGrid categories={categories} />
      </section>
    </div>
  );
}
```

**Tasks:**

- [ ] Create `/explore` route with proper data loading
- [ ] Build responsive explore page layout
- [ ] Create featured content carousel component
- [ ] Implement trending topics grid with growth indicators
- [ ] Build active organizations showcase

**Acceptance Criteria:**

- Explore page loads quickly with optimized data fetching
- All sections are responsive and visually appealing
- Trending calculations work correctly
- Mobile explore experience is intuitive

**Priority 3B: Trending Algorithm & Curation (Days 3-4)**

```sql
-- Materialized view for trending posts (refreshed hourly)
CREATE MATERIALIZED VIEW trending_posts AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.published_at,
  u.name as author_name,
  u.username as author_username,
  o.name as organization_name,
  o.slug as organization_slug,

  -- Trending score calculation with time decay
  (
    COALESCE(pv.view_count, 0) * 1.0 +
    COALESCE(pl.like_count, 0) * 10.0 +
    COALESCE(pc.comment_count, 0) * 5.0 +
    COALESCE(ps.share_count, 0) * 15.0 +
    -- Time decay factor (newer posts get boost)
    (EXTRACT(EPOCH FROM (NOW() - p.published_at)) / 3600.0 * -0.1) +
    -- Organization boost for verified/popular orgs
    CASE WHEN o.verified = true THEN 5.0 ELSE 0.0 END
  ) as trending_score,

  -- Growth indicators
  COALESCE(pv.view_count, 0) as current_views,
  COALESCE(pv_prev.view_count, 0) as previous_views,
  CASE
    WHEN COALESCE(pv_prev.view_count, 0) > 0
    THEN (COALESCE(pv.view_count, 0)::float / pv_prev.view_count::float - 1.0) * 100
    ELSE 0
  END as growth_percentage

FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN organizations o ON p.organization_id = o.id

-- Join view counts (current week)
LEFT JOIN (
  SELECT post_id, COUNT(*) as view_count
  FROM post_views
  WHERE viewed_at > NOW() - INTERVAL '7 days'
  GROUP BY post_id
) pv ON p.id = pv.post_id

-- Join view counts (previous week for growth)
LEFT JOIN (
  SELECT post_id, COUNT(*) as view_count
  FROM post_views
  WHERE viewed_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
  GROUP BY post_id
) pv_prev ON p.id = pv_prev.post_id

WHERE
  p.status = 'published'
  AND p.published_at > NOW() - INTERVAL '30 days' -- Only recent content

ORDER BY trending_score DESC
LIMIT 100;
```

**Tasks:**

- [ ] Implement trending algorithm with time decay and engagement weighting
- [ ] Create materialized views for performance optimization
- [ ] Build automated curation system for featured content
- [ ] Add manual curation interface for editors
- [ ] Implement trending topic detection based on tag frequency

**Acceptance Criteria:**

- Trending algorithm surfaces relevant, engaging content
- Materialized views refresh efficiently without blocking queries
- Manual curation overrides work correctly
- Trending topics reflect current platform activity

### Week 6: Content Discovery Components

**Priority 3C: Discovery Components (Days 1-3)**

```typescript
// src/components/explore/featured-content-carousel.tsx
function FeaturedContentCarousel({ posts }: { posts: FeaturedPost[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { trackContentView } = useAnalytics();

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [posts.length]);

  const handlePostClick = (post: FeaturedPost, index: number) => {
    trackContentView({
      contentId: post.id,
      contentType: 'post',
      source: 'featured_carousel',
      position: index,
    });
  };

  return (
    <div className="relative">
      {/* Main carousel display */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {posts.slice(0, 5).map((post, index) => (
          <Card
            key={post.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg",
              index === currentIndex && "ring-2 ring-primary"
            )}
            onClick={() => handlePostClick(post, index)}
          >
            <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
              {post.featuredImage ? (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Icons.fileText className="h-8 w-8" />
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-2 mb-2">{post.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icons.user className="h-3 w-3" />
                <span>{post.author.name}</span>
                <span>•</span>
                <span>{post.readingTime} min</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carousel indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {posts.slice(0, 5).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex ? "bg-primary" : "bg-muted-foreground"
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Tasks:**

- [ ] Build featured content carousel with auto-advance
- [ ] Create trending topics grid with growth indicators
- [ ] Implement category browsing interface
- [ ] Build organization discovery component
- [ ] Add rising writers/creators section

**Acceptance Criteria:**

- All discovery components are interactive and responsive
- Content click tracking works correctly
- Growth indicators display accurately
- Mobile discovery experience is optimized

**Priority 3D: Cross-Navigation Integration (Days 4-5)**

```typescript
// Seamless navigation between search and explore
// src/components/navigation/search-explore-bridge.tsx

function SearchExploreBridge() {
  const router = useRouter();
  const { pathname } = useRouter();

  const handleCategoryClick = (category: Category) => {
    // Navigate to search with category pre-selected
    router.navigate({
      to: '/search',
      search: {
        q: '',
        type: 'posts',
        categories: [category.slug],
      },
    });
  };

  const handleTopicClick = (topic: TrendingTopic) => {
    router.navigate({
      to: '/search',
      search: {
        q: topic.name,
        type: 'all',
      },
    });
  };

  const showSearchHint = pathname === '/explore';
  const showExploreHint = pathname === '/search';

  return (
    <>
      {/* Context-aware navigation hints */}
      {showSearchHint && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Looking for something specific?
            <Link to="/search" className="ml-1 text-primary hover:underline">
              Try our advanced search
            </Link>
          </p>
        </div>
      )}

      {showExploreHint && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Want to discover trending content?
            <Link to="/explore" className="ml-1 text-primary hover:underline">
              Browse our explore page
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
```

**Tasks:**

- [ ] Implement seamless navigation between search and explore
- [ ] Add context-aware navigation hints
- [ ] Build category-to-search flow integration
- [ ] Create topic-to-search navigation
- [ ] Implement breadcrumb navigation for filtered views

**Acceptance Criteria:**

- Navigation between search and explore feels natural
- Filter states transfer correctly between interfaces
- Context hints improve user discovery patterns
- Breadcrumbs help users understand their location

## Phase 4: Analytics & Performance Optimization (Weeks 7-8)

### Week 7: Comprehensive Analytics Integration

**Priority 4A: Search Performance Monitoring (Days 1-2)**

```typescript
// src/modules/search/middleware/performance-monitor.ts
export function withSearchPerformanceMonitoring<
  T extends (...args: any[]) => any,
>(fn: T, operationName: string): T {
  return ((...args: any[]) => {
    const startTime = performance.now();
    const result = fn(...args);

    if (result instanceof Promise) {
      return result
        .then((data) => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          // Track performance metrics
          trackSearchPerformance(
            operationName,
            args[0],
            data?.results?.length || 0,
            duration,
          );

          // Alert on slow queries
          if (duration > 1000) {
            Sentry.captureMessage('Slow search query detected', {
              level: 'warning',
              extra: {
                operation: operationName,
                duration_ms: duration,
                query: args[0]?.query,
                filters: args[0]?.filters,
              },
            });
          }

          return data;
        })
        .catch((error) => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          Sentry.captureException(error, {
            tags: {
              operation: operationName,
              duration_ms: duration,
            },
            extra: {
              query: args[0]?.query,
              filters: args[0]?.filters,
            },
          });

          throw error;
        });
    }

    return result;
  }) as T;
}

// Usage
export const searchPosts = withSearchPerformanceMonitoring(
  createServerFn({ method: 'GET' }).handler(async (filters) => {
    // Search implementation
  }),
  'search_posts',
);
```

**Tasks:**

- [ ] Implement comprehensive search performance monitoring
- [ ] Set up Sentry integration for search error tracking
- [ ] Create performance alerting for slow queries
- [ ] Build search health monitoring dashboard
- [ ] Add query optimization recommendations

**Acceptance Criteria:**

- All search operations are monitored for performance
- Slow queries trigger alerts and optimization workflows
- Error tracking provides actionable debugging information
- Performance metrics help identify optimization opportunities

**Priority 4B: User Behavior Analytics (Days 3-4)**

```typescript
// src/modules/search/hooks/use-search-analytics.ts
export function useSearchAnalytics() {
  const posthog = usePostHog();
  const { user } = useAuth();

  const trackSearch = useCallback(
    (filters: SearchFilters, resultCount: number, duration: number) => {
      const searchEvent = {
        // Query metrics
        query: filters.query,
        query_length: filters.query?.length || 0,
        query_complexity: calculateQueryComplexity(filters),

        // Filter usage
        content_type: filters.contentType,
        has_filters: Object.keys(filters).length > 1,
        filter_count: Object.keys(filters).length - 1, // Exclude query
        filter_categories: filters.categories?.length || 0,
        filter_tags: filters.tags?.length || 0,
        has_date_range: !!filters.dateRange,
        has_organization_filter: !!filters.organizationId,

        // Results metrics
        result_count: resultCount,
        has_results: resultCount > 0,
        result_density: resultCount > 0 ? resultCount / 20 : 0, // Assuming 20 per page

        // Performance metrics
        duration_ms: duration,
        is_slow_query: duration > 1000,

        // User context
        user_type: user?.role || 'anonymous',
        organization_context: user?.activeOrganization?.id,

        // Session context
        search_session_id: getSearchSessionId(),
        is_refinement: isSearchRefinement(filters),
      };

      posthog?.capture('search_performed', searchEvent);

      // Track zero results for content gap analysis
      if (resultCount === 0 && filters.query) {
        posthog?.capture('search_zero_results', {
          query: filters.query,
          query_length: filters.query.length,
          filter_count: Object.keys(filters).length - 1,
          suggested_alternatives: generateSearchSuggestions(filters.query),
        });
      }
    },
    [posthog, user],
  );

  const trackFilterUsage = useCallback(
    (filterId: string, value: FilterValue) => {
      posthog?.capture('search_filter_applied', {
        filter_id: filterId,
        filter_type: typeof value,
        is_array: Array.isArray(value),
        value_count: Array.isArray(value) ? value.length : 1,
        filter_category: getFilterCategory(filterId),
        user_expertise: user?.searchExpertiseLevel || 'novice',
      });
    },
    [posthog, user],
  );

  const trackResultInteraction = useCallback(
    (
      result: SearchResult,
      action: 'click' | 'view' | 'save' | 'share',
      position: number,
      context: SearchFilters,
    ) => {
      posthog?.capture('search_result_interaction', {
        // Result details
        result_type: result.type,
        result_id: result.id,
        result_title: result.title,
        result_author: result.author?.id,
        result_organization: result.organization?.id,

        // Interaction details
        action,
        position,
        result_relevance_score: result.relevanceScore,
        time_to_click: Date.now() - getSearchStartTime(),

        // Search context
        search_query: context.query,
        search_filters: Object.keys(context).length - 1,

        // User behavior patterns
        clicks_in_session: getSessionClickCount(),
        search_refinements: getSearchRefinementCount(),
      });

      // Identify successful search patterns
      if (action === 'click' && position <= 3) {
        posthog?.capture('successful_search', {
          query: context.query,
          result_position: position,
          search_effectiveness_score: calculateSearchEffectiveness(
            context,
            result,
          ),
        });
      }
    },
    [posthog],
  );

  return {
    trackSearch,
    trackFilterUsage,
    trackResultInteraction,
  };
}
```

**Tasks:**

- [ ] Implement comprehensive user behavior analytics
- [ ] Create search session tracking and analysis
- [ ] Build content gap analysis from zero-result queries
- [ ] Add search effectiveness scoring system
- [ ] Implement user search expertise profiling

**Acceptance Criteria:**

- All user search interactions are tracked with proper context
- Zero-result queries provide actionable content creation insights
- User behavior patterns inform UX optimization
- Search effectiveness metrics guide algorithm improvements

### Week 8: Performance Optimization & Production Polish

**Priority 4C: Query Performance Optimization (Days 1-3)**

```typescript
// Connection pool optimization for search workloads
// src/lib/db/search-connection.ts
const searchSql = postgres(env.DATABASE_URL, {
  // Optimized for read-heavy search workloads
  max: 20, // Higher connection limit for search
  idle_timeout: 30,
  connect_timeout: 10,

  // Disable prepared statements for dynamic search queries
  prepare: false,

  // Connection optimizations
  connection: {
    application_name: 'search-service',
    statement_timeout: '30s', // Prevent long-running queries
    idle_in_transaction_session_timeout: '5s',
    shared_preload_libraries: 'pg_stat_statements,pg_trgm',

    // Search-specific optimizations
    work_mem: '256MB', // Higher memory for complex search queries
    effective_cache_size: '4GB', // Assume good caching available
    random_page_cost: 1.1, // SSD-optimized
  },

  // Enable SSL in production
  ssl: env.NODE_ENV === 'production' ? 'require' : false,
});

export const searchDb = drizzle(searchSql, {
  logger: env.NODE_ENV === 'development',
});

// Query optimization utilities
export async function optimizeSearchQuery(
  query: string,
  filters: SearchFilters,
): Promise<OptimizedQuery> {
  // Analyze query complexity and choose optimal execution path
  const complexity = calculateQueryComplexity(query, filters);

  if (complexity.score > 0.8) {
    // High complexity: use materialized views and limit results
    return {
      useMatView: true,
      maxResults: 100,
      requireExactMatch: false,
      enableFuzzySearch: false,
    };
  } else if (complexity.score > 0.5) {
    // Medium complexity: balance performance and accuracy
    return {
      useMatView: false,
      maxResults: 500,
      requireExactMatch: true,
      enableFuzzySearch: true,
    };
  } else {
    // Low complexity: full search capabilities
    return {
      useMatView: false,
      maxResults: 1000,
      requireExactMatch: false,
      enableFuzzySearch: true,
    };
  }
}
```

**Tasks:**

- [ ] Optimize database connection pools for search workloads
- [ ] Implement intelligent query optimization based on complexity
- [ ] Create search result caching strategy with TanStack Query
- [ ] Build query execution plan analysis and optimization
- [ ] Add database index monitoring and optimization recommendations

**Acceptance Criteria:**

- Search queries consistently execute in <200ms for 95th percentile
- Connection pools handle concurrent search load efficiently
- Query optimization reduces resource usage while maintaining relevance
- Caching strategy improves user experience without stale results

**Priority 4D: Mobile Performance & PWA Features (Days 4-5)**

```typescript
// Mobile-optimized search experience
// src/components/search/mobile-search-interface.tsx
function MobileSearchInterface() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Optimize for mobile performance
  const {
    query,
    results,
    isLoading,
    updateQuery,
  } = useRealtimeSearch({}, {
    debounceMs: 500, // Longer debounce on mobile to reduce requests
    minQueryLength: 2,
  });

  // Preload critical search resources
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Cache search API responses for offline access
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile search header */}
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <SearchInput
            value={query}
            onChange={updateQuery}
            placeholder="Search..."
            className="flex-1"
            autoFocus={isSearchActive}
            onFocus={() => setIsSearchActive(true)}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFilterSheetOpen(true)}
            className="flex-shrink-0"
          >
            <Icons.filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick filter chips */}
        {!isSearchActive && (
          <ScrollArea className="w-full mt-3">
            <div className="flex gap-2 pb-2">
              <FilterChip active onClick={() => {}}>All</FilterChip>
              <FilterChip onClick={() => {}}>Posts</FilterChip>
              <FilterChip onClick={() => {}}>People</FilterChip>
              <FilterChip onClick={() => {}}>Organizations</FilterChip>
            </div>
          </ScrollArea>
        )}
      </header>

      {/* Search results with virtual scrolling */}
      <main className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        ) : (
          <VirtualizedSearchResults
            results={results}
            onResultClick={handleResultClick}
            estimateSize={() => 120} // Estimated height per result
            overscan={5}
          />
        )}
      </main>

      {/* Mobile filter bottom sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Search Filters</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full">
            <MobileFilterPanel
              onFiltersChange={handleFiltersChange}
              onClose={() => setIsFilterSheetOpen(false)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

**Tasks:**

- [ ] Optimize mobile search interface for touch interactions
- [ ] Implement virtual scrolling for large result sets
- [ ] Create PWA features for offline search access
- [ ] Build mobile-optimized filter bottom sheet
- [ ] Add search result prefetching on mobile

**Acceptance Criteria:**

- Mobile search performance matches desktop experience
- Touch interactions feel natural and responsive
- PWA features work offline with cached results
- Virtual scrolling handles thousands of results smoothly

## Success Metrics & Monitoring

### Key Performance Indicators (KPIs)

**Search Performance:**

- Search response time: <200ms for 95th percentile
- Zero-result query rate: <15%
- Search-to-click conversion rate: >60%
- Mobile search completion rate: >90%

**User Engagement:**

- Average search session length: >2 minutes
- Filter usage rate: >40% of searches
- Search refinement rate: 20-30% (indicates good discovery)
- Cross-navigation between search/explore: >25%

**Content Discovery:**

- Explore page bounce rate: <30%
- Category exploration rate: >25%
- Featured content click-through rate: >15%
- Organization discovery rate: >10%

**Technical Performance:**

- Database query performance consistency: <500ms for complex filters
- Search index update frequency: Real-time for new content
- API error rate: <0.1%
- Mobile vs desktop search pattern analysis

### Monitoring & Alerting

**Performance Alerts:**

- Search query duration >1s triggers optimization review
- Zero-result queries >20% triggers content gap analysis
- Error rate >0.5% triggers immediate investigation
- Database connection pool saturation triggers scaling

**User Experience Alerts:**

- Search abandonment rate >50% triggers UX review
- Mobile search completion rate <80% triggers mobile optimization
- Filter usage rate <30% triggers filter UX improvement

### Post-Launch Optimization Plan

**Month 1: Performance Tuning**

- Analyze real user search patterns
- Optimize database indexes based on actual queries
- Fine-tune trending algorithm weights
- Improve search relevance based on user feedback

**Month 2: Feature Enhancement**

- Add personalized search based on user behavior
- Implement saved searches and search alerts
- Build advanced search operators (AND, OR, quotes)
- Add search result export functionality

**Month 3: Advanced Analytics**

- Build comprehensive search analytics dashboard
- Implement A/B testing for search algorithm improvements
- Add predictive search suggestions
- Create content recommendation engine based on search patterns

This roadmap provides a structured approach to building a comprehensive search and discovery system that serves users efficiently while providing rich analytics for continuous improvement.
