# Search API

This document covers all search and discovery server functions for finding content, users, and organizations across the platform.

## Overview

The search system provides:

- **Content search** - Full-text search across posts with advanced filtering
- **User discovery** - Find users by name, username, and expertise
- **Organization search** - Discover organizations by name and category
- **Global search** - Universal search across all content types

## Content Search Functions

### Search Posts

```typescript
export const searchPosts = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      query: t.string().min(1),
      organizationId: t.string().optional(),
      authorId: t.string().optional(),
      tags: t.array(t.string()).optional(),
      publishingType: t
        .enum(['personal', 'organization_member', 'organization_official'])
        .optional(),
      dateRange: t
        .object({
          from: t.string().optional(),
          to: t.string().optional(),
        })
        .optional(),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
      sortBy: t.enum(['relevance', 'date', 'views']).default('relevance'),
    }),
  )
  .handler(
    async ({
      query,
      organizationId,
      authorId,
      tags,
      publishingType,
      dateRange,
      limit,
      offset,
      sortBy,
    }) => {
      // Build the full-text search query
      const searchQuery = query
        .split(' ')
        .map((term) => `${term}:*`)
        .join(' & ');

      let baseQuery = db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          publishedAt: posts.publishedAt,
          wordCount: posts.wordCount,
          readingTime: posts.readingTime,
          publishingType: posts.publishingType,
          // Search ranking
          rank: sql<number>`ts_rank(
            setweight(to_tsvector('english', ${posts.title}), 'A') ||
            setweight(to_tsvector('english', ${posts.content}), 'B') ||
            setweight(to_tsvector('english', COALESCE(${posts.excerpt}, '')), 'C'),
            plainto_tsquery('english', ${query})
          )`,
          // Headline for search snippets
          headline: sql<string>`ts_headline('english', ${posts.content}, plainto_tsquery('english', ${query}), 'MaxWords=30, MinWords=10')`,
        })
        .from(posts);

      // Add joins for related data
      baseQuery = baseQuery
        .leftJoin(users, eq(posts.authorId, users.id))
        .leftJoin(organizations, eq(posts.organizationId, organizations.id));

      // Build where conditions
      const whereConditions = [
        eq(posts.status, 'published'),
        sql`(
          setweight(to_tsvector('english', ${posts.title}), 'A') ||
          setweight(to_tsvector('english', ${posts.content}), 'B') ||
          setweight(to_tsvector('english', COALESCE(${posts.excerpt}, '')), 'C')
        ) @@ plainto_tsquery('english', ${query})`,
      ];

      if (organizationId) {
        whereConditions.push(eq(posts.organizationId, organizationId));
      }

      if (authorId) {
        whereConditions.push(eq(posts.authorId, authorId));
      }

      if (publishingType) {
        whereConditions.push(eq(posts.publishingType, publishingType));
      }

      if (dateRange?.from) {
        whereConditions.push(gte(posts.publishedAt, new Date(dateRange.from)));
      }

      if (dateRange?.to) {
        whereConditions.push(lte(posts.publishedAt, new Date(dateRange.to)));
      }

      // Add tag filtering if specified
      if (tags?.length) {
        const taggedPosts = await db
          .select({ postId: postTags.postId })
          .from(postTags)
          .where(inArray(postTags.tag, tags))
          .groupBy(postTags.postId)
          .having(sql`COUNT(DISTINCT ${postTags.tag}) = ${tags.length}`);

        const postIds = taggedPosts.map((t) => t.postId);
        if (postIds.length === 0) {
          return { posts: [], total: 0 };
        }
        whereConditions.push(inArray(posts.id, postIds));
      }

      // Apply where conditions
      baseQuery = baseQuery.where(and(...whereConditions));

      // Apply sorting
      switch (sortBy) {
        case 'relevance':
          baseQuery = baseQuery.orderBy(desc(sql`rank`));
          break;
        case 'date':
          baseQuery = baseQuery.orderBy(desc(posts.publishedAt));
          break;
        case 'views':
          // Assuming we have view counts in the future
          baseQuery = baseQuery.orderBy(
            desc(posts.publishedAt), // Fallback to date for now
          );
          break;
      }

      // Get results with author and organization info
      const results = await baseQuery
        .limit(limit)
        .offset(offset)
        .leftJoin(users, eq(posts.authorId, users.id))
        .leftJoin(organizations, eq(posts.organizationId, organizations.id))
        .leftJoin(postTags, eq(postTags.postId, posts.id));

      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(posts)
        .where(and(...whereConditions.slice(0, -1))); // Remove tag condition for count

      return {
        posts: results,
        total: countResult[0].count,
        query,
        filters: {
          organizationId,
          authorId,
          tags,
          publishingType,
          dateRange,
        },
      };
    },
  );
```

### Get Search Suggestions

```typescript
export const getSearchSuggestions = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      query: t.string().min(1),
      type: t.enum(['posts', 'users', 'organizations', 'all']).default('all'),
      limit: t.number().default(5).max(10),
    }),
  )
  .handler(async ({ query, type, limit }) => {
    const suggestions = {
      posts: [],
      users: [],
      organizations: [],
    };

    if (type === 'posts' || type === 'all') {
      suggestions.posts = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          type: sql<string>`'post'`,
        })
        .from(posts)
        .where(
          and(eq(posts.status, 'published'), ilike(posts.title, `%${query}%`)),
        )
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
    }

    if (type === 'users' || type === 'all') {
      suggestions.users = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatar: users.avatar,
          type: sql<string>`'user'`,
        })
        .from(users)
        .where(
          or(
            ilike(users.name, `%${query}%`),
            ilike(users.username, `%${query}%`),
          ),
        )
        .orderBy(users.name)
        .limit(limit);
    }

    if (type === 'organizations' || type === 'all') {
      suggestions.organizations = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          avatar: organizations.avatar,
          type: sql<string>`'organization'`,
        })
        .from(organizations)
        .where(ilike(organizations.name, `%${query}%`))
        .orderBy(organizations.name)
        .limit(limit);
    }

    return suggestions;
  });
```

## User Search Functions

### Search Users

```typescript
export const searchUsers = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      query: t.string().min(1),
      organizationId: t.string().optional(),
      skills: t.array(t.string()).optional(),
      location: t.string().optional(),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
    }),
  )
  .handler(
    async ({ query, organizationId, skills, location, limit, offset }) => {
      let baseQuery = db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          bio: users.bio,
          location: users.location,
          website: users.website,
          // Search ranking for users
          rank: sql<number>`ts_rank(
          setweight(to_tsvector('english', ${users.name}), 'A') ||
          setweight(to_tsvector('english', COALESCE(${users.bio}, '')), 'B'),
          plainto_tsquery('english', ${query})
        )`,
        })
        .from(users);

      const whereConditions = [
        sql`(
        setweight(to_tsvector('english', ${users.name}), 'A') ||
        setweight(to_tsvector('english', COALESCE(${users.bio}, '')), 'B')
      ) @@ plainto_tsquery('english', ${query})`,
      ];

      // Filter by organization membership
      if (organizationId) {
        baseQuery = baseQuery.innerJoin(
          organizationMembers,
          eq(organizationMembers.userId, users.id),
        );
        whereConditions.push(
          eq(organizationMembers.organizationId, organizationId),
        );
      }

      // Filter by location
      if (location) {
        whereConditions.push(ilike(users.location, `%${location}%`));
      }

      const results = await baseQuery
        .where(and(...whereConditions))
        .orderBy(desc(sql`rank`), users.name)
        .limit(limit)
        .offset(offset);

      // Get follower counts and mutual connections
      const enrichedResults = await Promise.all(
        results.map(async (user) => {
          const stats = await db
            .select({
              followersCount: sql<number>`COUNT(DISTINCT ${userFollows.followerId})`,
              postsCount: sql<number>`COUNT(DISTINCT ${posts.id})`,
            })
            .from(users)
            .leftJoin(userFollows, eq(userFollows.followingId, user.id))
            .leftJoin(posts, eq(posts.authorId, user.id))
            .where(eq(users.id, user.id))
            .groupBy(users.id);

          return {
            ...user,
            stats: stats[0] || { followersCount: 0, postsCount: 0 },
          };
        }),
      );

      return {
        users: enrichedResults,
        total: enrichedResults.length,
      };
    },
  );
```

## Organization Search Functions

### Search Organizations

```typescript
export const searchOrganizations = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      query: t.string().min(1),
      category: t.string().optional(),
      memberCount: t
        .object({
          min: t.number().optional(),
          max: t.number().optional(),
        })
        .optional(),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
    }),
  )
  .handler(async ({ query, category, memberCount, limit, offset }) => {
    let baseQuery = db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        avatar: organizations.avatar,
        website: organizations.website,
        createdAt: organizations.createdAt,
        // Search ranking
        rank: sql<number>`ts_rank(
          setweight(to_tsvector('english', ${organizations.name}), 'A') ||
          setweight(to_tsvector('english', COALESCE(${organizations.description}, '')), 'B'),
          plainto_tsquery('english', ${query})
        )`,
        memberCount: sql<number>`COUNT(DISTINCT ${organizationMembers.id})`,
        postCount: sql<number>`COUNT(DISTINCT ${posts.id})`,
      })
      .from(organizations)
      .leftJoin(
        organizationMembers,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .leftJoin(posts, eq(posts.organizationId, organizations.id));

    const whereConditions = [
      sql`(
        setweight(to_tsvector('english', ${organizations.name}), 'A') ||
        setweight(to_tsvector('english', COALESCE(${organizations.description}, '')), 'B')
      ) @@ plainto_tsquery('english', ${query})`,
    ];

    // Apply member count filters
    baseQuery = baseQuery.groupBy(organizations.id);

    if (memberCount?.min) {
      baseQuery = baseQuery.having(
        gte(
          sql<number>`COUNT(DISTINCT ${organizationMembers.id})`,
          memberCount.min,
        ),
      );
    }

    if (memberCount?.max) {
      baseQuery = baseQuery.having(
        lte(
          sql<number>`COUNT(DISTINCT ${organizationMembers.id})`,
          memberCount.max,
        ),
      );
    }

    const results = await baseQuery
      .where(and(...whereConditions))
      .orderBy(desc(sql`rank`), organizations.name)
      .limit(limit)
      .offset(offset);

    return {
      organizations: results,
      total: results.length,
    };
  });
```

## Global Search Function

### Universal Search

```typescript
export const globalSearch = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      query: t.string().min(1),
      filters: t
        .object({
          types: t
            .array(t.enum(['posts', 'users', 'organizations']))
            .optional(),
          organizationId: t.string().optional(),
        })
        .optional(),
      limit: t.number().default(20).max(50),
    }),
  )
  .handler(async ({ query, filters, limit }) => {
    const results = {
      posts: [],
      users: [],
      organizations: [],
      totalResults: 0,
    };

    const types = filters?.types || ['posts', 'users', 'organizations'];
    const perTypeLimit = Math.ceil(limit / types.length);

    // Search posts
    if (types.includes('posts')) {
      const postResults = await searchPosts({
        query,
        organizationId: filters?.organizationId,
        limit: perTypeLimit,
        offset: 0,
        sortBy: 'relevance',
      });
      results.posts = postResults.posts.slice(0, perTypeLimit);
    }

    // Search users
    if (types.includes('users')) {
      const userResults = await searchUsers({
        query,
        organizationId: filters?.organizationId,
        limit: perTypeLimit,
        offset: 0,
      });
      results.users = userResults.users.slice(0, perTypeLimit);
    }

    // Search organizations
    if (types.includes('organizations')) {
      const orgResults = await searchOrganizations({
        query,
        limit: perTypeLimit,
        offset: 0,
      });
      results.organizations = orgResults.organizations.slice(0, perTypeLimit);
    }

    results.totalResults =
      results.posts.length +
      results.users.length +
      results.organizations.length;

    return results;
  });
```

## Search Analytics Functions

### Track Search Query

```typescript
export const trackSearchQuery = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      query: t.string(),
      resultCount: t.number(),
      selectedResult: t
        .object({
          type: t.enum(['post', 'user', 'organization']),
          id: t.string(),
          position: t.number(),
        })
        .optional(),
    }),
  )
  .handler(async ({ query, resultCount, selectedResult }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    // Store search analytics (would implement with analytics table)
    await db.insert(searchAnalytics).values({
      query,
      userId: session?.user?.id,
      resultCount,
      selectedType: selectedResult?.type,
      selectedId: selectedResult?.id,
      selectedPosition: selectedResult?.position,
    });

    return { success: true };
  });
```

## React Query Integration

### Search Queries

```typescript
// src/modules/search/hooks/use-queries.ts
export const searchQueries = {
  posts: (params: SearchPostsParams) =>
    queryOptions({
      queryKey: ['search', 'posts', params] as const,
      queryFn: () => searchPosts(params),
      enabled: params.query.length > 0,
    }),

  users: (params: SearchUsersParams) =>
    queryOptions({
      queryKey: ['search', 'users', params] as const,
      queryFn: () => searchUsers(params),
      enabled: params.query.length > 0,
    }),

  organizations: (params: SearchOrganizationsParams) =>
    queryOptions({
      queryKey: ['search', 'organizations', params] as const,
      queryFn: () => searchOrganizations(params),
      enabled: params.query.length > 0,
    }),

  global: (query: string, filters?: GlobalSearchFilters) =>
    queryOptions({
      queryKey: ['search', 'global', query, filters] as const,
      queryFn: () => globalSearch({ query, filters }),
      enabled: query.length > 0,
    }),

  suggestions: (query: string, type = 'all') =>
    queryOptions({
      queryKey: ['search', 'suggestions', query, type] as const,
      queryFn: () => getSearchSuggestions({ query, type }),
      enabled: query.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
};

// Custom hooks
export function useSearchPosts(params: SearchPostsParams) {
  return useQuery(searchQueries.posts(params));
}

export function useSearchUsers(params: SearchUsersParams) {
  return useQuery(searchQueries.users(params));
}

export function useSearchOrganizations(params: SearchOrganizationsParams) {
  return useQuery(searchQueries.organizations(params));
}

export function useGlobalSearch(query: string, filters?: GlobalSearchFilters) {
  return useQuery(searchQueries.global(query, filters));
}

export function useSearchSuggestions(query: string, type = 'all') {
  return useQuery(searchQueries.suggestions(query, type));
}
```

### Search with Debouncing

```typescript
export function useSearchWithDebounce(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchResults = useGlobalSearch(debouncedQuery);

  return {
    query,
    setQuery,
    debouncedQuery,
    ...searchResults,
  };
}
```

## Advanced Filtering Architecture

The search system includes a comprehensive filtering architecture supporting dynamic, type-safe filter configurations across all content types.

### Filter Type System

```typescript
// src/modules/search/types/filters.ts
export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | DateRange;

export interface DateRange {
  from?: string;
  to?: string;
}

export interface BaseFilter {
  id: string;
  label: string;
  type:
    | 'select'
    | 'multi-select'
    | 'date-range'
    | 'numeric-range'
    | 'boolean'
    | 'search';
  category: 'content' | 'metadata' | 'engagement' | 'temporal';
  value?: FilterValue;
  options?: FilterOption[];
  placeholder?: string;
  validation?: FilterValidation;
}

export interface FilterGroup {
  id: string;
  label: string;
  icon?: string;
  collapsible: boolean;
  defaultExpanded: boolean;
  filters: BaseFilter[];
}
```

### Dynamic Filter Configuration

```typescript
// src/modules/search/config/filter-config.ts
export const searchFilterConfig: Record<string, FilterGroup[]> = {
  posts: [
    {
      id: 'content-type',
      label: 'Content',
      icon: 'FileText',
      collapsible: false,
      defaultExpanded: true,
      filters: [
        {
          id: 'content-type',
          label: 'Content Type',
          type: 'multi-select',
          category: 'content',
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
      id: 'metadata',
      label: 'Post Details',
      icon: 'Info',
      collapsible: true,
      defaultExpanded: false,
      filters: [
        {
          id: 'reading-time',
          label: 'Reading Time',
          type: 'select',
          category: 'metadata',
          options: [
            { value: 'any', label: 'Any length' },
            { value: '0-5', label: 'Quick read (< 5 min)' },
            { value: '5-10', label: 'Medium read (5-10 min)' },
            { value: '10-999', label: 'Long read (> 10 min)' },
          ],
        },
        {
          id: 'date-range',
          label: 'Published Date',
          type: 'date-range',
          category: 'temporal',
        },
      ],
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: 'Heart',
      collapsible: true,
      defaultExpanded: false,
      filters: [
        {
          id: 'min-likes',
          label: 'Minimum Likes',
          type: 'numeric-range',
          category: 'engagement',
          validation: { min: 0, max: 10000 },
        },
      ],
    },
  ],
  users: [
    // User-specific filter configurations
  ],
  organizations: [
    // Organization-specific filter configurations
  ],
};
```

### Filter State Management

```typescript
// src/modules/search/hooks/use-search-filters.ts
export function useSearchFilters(contentType: string = 'posts') {
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const filterConfig = useMemo(() => {
    return searchFilterConfig[contentType] || searchFilterConfig.posts;
  }, [contentType]);

  const updateFilter = useCallback((filterId: string, value: FilterValue) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete newFilters[filterId];
      } else {
        newFilters[filterId] = value;
      }

      return newFilters;
    });
  }, []);

  // Convert filter state to search API format
  const toSearchFilters = useCallback(() => {
    const searchFilters: Record<string, unknown> = {};

    Object.entries(filters).forEach(([filterId, value]) => {
      switch (filterId) {
        case 'content-type':
          searchFilters.contentType = Array.isArray(value) ? value : [value];
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
        // Add more filter mappings as needed
      }
    });

    return searchFilters;
  }, [filters]);

  return {
    filters,
    filterConfig,
    activeFilterCount,
    updateFilter,
    toSearchFilters,
  };
}
```

## Performance Optimization

### Query Performance Monitoring

```typescript
// src/modules/search/middleware/performance-monitor.ts
import { createServerFn } from '@tanstack/react-start';
import { logger } from '@/lib/logger';

export function withPerformanceMonitoring<
  T extends (...args: unknown[]) => unknown,
>(fn: T, operationName: string): T {
  return ((...args: unknown[]) => {
    const startTime = performance.now();
    const result = fn(...args);

    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        logger.info('search_performance', {
          operation: operationName,
          duration_ms: duration,
          args: args.length > 0 ? JSON.stringify(args[0]) : undefined,
        });

        // Alert on slow queries
        if (duration > 1000) {
          logger.warn('slow_search_query', {
            operation: operationName,
            duration_ms: duration,
            args: JSON.stringify(args[0]),
          });
        }
      });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    logger.info('search_performance', {
      operation: operationName,
      duration_ms: duration,
    });

    return result;
  }) as T;
}

// Usage
export const searchContent = withPerformanceMonitoring(
  createServerFn({ method: 'POST' })
    .validator((data: SearchFilters) => data)
    .handler(async (filters: SearchFilters) => {
      // Search implementation
    }),
  'search_content',
);
```

### Real-time Search Optimization

```typescript
// src/modules/search/hooks/use-realtime-search.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchQueries } from '@/modules/search/hooks/use-queries';
import type { SearchFilters, SearchResult } from '@/modules/search/types';

interface UseRealtimeSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  enabled?: boolean;
}

export function useRealtimeSearch(
  initialFilters: SearchFilters = {},
  options: UseRealtimeSearchOptions = {},
) {
  const { debounceMs = 300, minQueryLength = 2, enabled = true } = options;

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] =
    useState<SearchFilters>(initialFilters);
  const [isTyping, setIsTyping] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce filter changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsTyping(true);

    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
      setIsTyping(false);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, debounceMs]);

  // Determine if search should be enabled
  const shouldSearch =
    enabled &&
    (!debouncedFilters.query ||
      debouncedFilters.query.length >= minQueryLength);

  // Search query
  const searchQuery = useQuery({
    ...searchQueries.search(debouncedFilters),
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateQuery = useCallback(
    (query: string) => {
      updateFilters({ query });
    },
    [updateFilters],
  );

  const clearSearch = useCallback(() => {
    setFilters({});
    setDebouncedFilters({});
  }, []);

  return {
    // State
    filters,
    debouncedFilters,
    isTyping,

    // Query state
    results: searchQuery.data?.results || [],
    totalCount: searchQuery.data?.totalCount || 0,
    facets: searchQuery.data?.facets,
    isLoading: searchQuery.isLoading || isTyping,
    isError: searchQuery.isError,
    error: searchQuery.error,

    // Actions
    updateFilters,
    updateQuery,
    clearSearch,
    refetch: searchQuery.refetch,
  };
}
```

### Connection Pool Configuration

```typescript
// src/lib/db/search-connection.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/configs/env';

// Dedicated connection pool for search operations
const searchSql = postgres(env.DATABASE_URL, {
  // Optimized for read-heavy search workloads
  max: 15, // Higher connection limit
  idle_timeout: 30,
  connect_timeout: 10,

  // Disable prepared statements for dynamic search queries
  prepare: false,

  // Enable connection pooling optimizations
  connection: {
    application_name: 'search-service',
    statement_timeout: '30s', // Prevent long-running queries
    idle_in_transaction_session_timeout: '5s',
  },

  // Enable SSL in production
  ssl: env.NODE_ENV === 'production' ? 'require' : false,
});

export const searchDb = drizzle(searchSql, {
  logger: env.NODE_ENV === 'development',
});

// Connection health check
export async function checkSearchDbHealth() {
  try {
    const result = await searchSql`SELECT 1 as health`;
    return result.length > 0;
  } catch (error) {
    console.error('Search DB health check failed:', error);
    return false;
  }
}
```

## Analytics Integration

### Sentry Performance Monitoring

```typescript
// src/modules/search/middleware/sentry-monitoring.ts
import * as Sentry from '@sentry/node';
import type { SearchFilters } from '@/modules/search/types';

export function trackSearchPerformance(
  operation: string,
  filters: SearchFilters,
  resultCount: number,
  duration: number,
) {
  // Track search performance
  Sentry.metrics.increment('search.query.count', 1, {
    tags: {
      operation,
      content_type: filters.contentType?.join(',') || 'all',
      has_query: !!filters.query,
      has_filters: Object.keys(filters).length > 1,
    },
  });

  // Track search latency
  Sentry.metrics.timing('search.query.duration', duration, 'millisecond', {
    tags: {
      operation,
      result_count_bucket: getResultCountBucket(resultCount),
    },
  });

  // Track slow queries
  if (duration > 1000) {
    Sentry.captureMessage('Slow search query detected', {
      level: 'warning',
      tags: {
        operation,
        duration_ms: duration,
        result_count: resultCount,
      },
      extra: {
        filters: JSON.stringify(filters),
      },
    });
  }

  // Track zero results
  if (resultCount === 0 && filters.query) {
    Sentry.metrics.increment('search.zero_results', 1, {
      tags: {
        query_length: filters.query.length.toString(),
        has_filters: Object.keys(filters).length > 1,
      },
    });
  }
}

function getResultCountBucket(count: number): string {
  if (count === 0) return '0';
  if (count <= 10) return '1-10';
  if (count <= 50) return '11-50';
  if (count <= 100) return '51-100';
  return '100+';
}

// Search event tracking
export function trackSearchEvent(
  event:
    | 'search_initiated'
    | 'filter_applied'
    | 'result_clicked'
    | 'zero_results',
  properties: Record<string, unknown> = {},
) {
  Sentry.addBreadcrumb({
    category: 'search',
    message: event,
    data: properties,
    level: 'info',
  });

  // Also track as custom event for analytics
  Sentry.captureMessage(`Search Event: ${event}`, {
    level: 'info',
    tags: {
      event_type: 'search_analytics',
      search_event: event,
    },
    extra: properties,
  });
}
```

### PostHog Analytics Integration

```typescript
// src/modules/search/hooks/use-search-analytics.ts
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { SearchFilters, SearchResult } from '@/modules/search/types';

export function useSearchAnalytics() {
  const posthog = usePostHog();

  const trackSearch = (
    filters: SearchFilters,
    resultCount: number,
    duration: number,
  ) => {
    posthog?.capture('search_performed', {
      query: filters.query,
      query_length: filters.query?.length || 0,
      content_type: filters.contentType,
      has_filters: Object.keys(filters).length > 1,
      result_count: resultCount,
      duration_ms: duration,
      filter_categories: filters.categories?.length || 0,
      filter_tags: filters.tags?.length || 0,
      date_range: !!filters.dateRange,
      min_likes: filters.minLikes || 0,
    });
  };

  const trackFilterUsage = (filterId: string, value: FilterValue) => {
    posthog?.capture('search_filter_applied', {
      filter_id: filterId,
      filter_type: typeof value,
      is_array: Array.isArray(value),
      value_count: Array.isArray(value) ? value.length : 1,
    });
  };

  const trackResultClick = (
    result: SearchResult,
    position: number,
    query?: string,
  ) => {
    posthog?.capture('search_result_clicked', {
      result_type: result.type,
      result_id: result.id,
      position,
      query,
      query_length: query?.length || 0,
      relevance_score: result.relevanceScore,
    });

    // Identify user behavior patterns
    posthog?.capture('content_engagement', {
      content_type: result.type,
      content_id: result.id,
      source: 'search',
      position,
    });
  };

  const trackZeroResults = (filters: SearchFilters) => {
    posthog?.capture('search_zero_results', {
      query: filters.query,
      query_length: filters.query?.length || 0,
      filter_count: Object.keys(filters).length - 1, // Exclude query
      has_categories: !!filters.categories?.length,
      has_tags: !!filters.tags?.length,
      has_date_range: !!filters.dateRange,
    });
  };

  return {
    trackSearch,
    trackFilterUsage,
    trackResultClick,
    trackZeroResults,
  };
}
```

## Strategic Context

This search API implements the content discovery system outlined in:

- **[Search & Discovery System](../../.serena/memories/search_discovery_system_design.md)** - Full-text search and content discovery architecture
- **[Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md)** - Content findability and organization

For related documentation, see:

- **[Posts API](./posts.md)** - Content management and publishing
- **[Users API](./users.md)** - User profiles and discovery
- **[Organizations API](./organizations.md)** - Organization search and discovery
- **[Database Design](../architecture/database.md)** - Full-text search implementation and indexing strategies
