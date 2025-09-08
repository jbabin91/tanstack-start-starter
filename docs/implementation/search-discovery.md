# Search & Discovery Implementation Guide

This guide provides complete implementation patterns for search and discovery features including full-text search, filtering, content categorization, and user discovery, built on PostgreSQL's native search capabilities.

## Database Foundation (Ready)

The search and discovery system is built on these existing database tables and indexes:

```sql
-- Full-text search indexes on posts
CREATE INDEX posts_search_idx ON posts
USING gin(to_tsvector('english', title || ' ' || content));

-- Trigram indexes for fuzzy matching
CREATE INDEX posts_title_trgm_idx ON posts
USING gin(title gin_trgm_ops);

-- Core search tables
posts (
  id,
  title,
  content,
  excerpt,
  status,
  author_id,
  organization_id,
  published_at,
  view_count,
  like_count,
  comment_count,
  reading_time,
  word_count,
  created_at,
  updated_at
)

-- Content categorization
categories (
  id,
  name,
  slug,
  description,
  color,
  icon,
  parent_id,          -- Hierarchical categories
  post_count,         -- Denormalized for performance
  is_active,
  sort_order,
  created_at,
  updated_at
)

post_categories (
  id,
  post_id,
  category_id,
  created_at
)

post_tags (
  id,
  post_id,
  tag,                -- Freeform tags
  created_at
)

-- Search analytics
search_queries (
  id,
  query,
  user_id,
  organization_id,
  result_count,
  response_time_ms,
  content_type,       -- posts, users, organizations, all
  filters,            -- JSONB for applied filters
  clicked_result_id,
  clicked_result_type,
  clicked_position,
  ip_address,
  user_agent,
  created_at
)
```

## API Implementation Patterns

### 1. Full-Text Search

Powerful PostgreSQL-based search with ranking and filtering.

```typescript
// src/modules/search/api/search-content.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { eq, and, or, desc, asc, sql, gte, lte, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  posts,
  users,
  organizations,
  categories,
  postCategories,
  postTags,
  searchQueries,
} from '@/lib/db/schemas';
import { auth } from '@/lib/auth';
import { nanoid } from '@/lib/nanoid';

const SearchFiltersType = type({
  'contentType?': "'posts' | 'users' | 'organizations' | 'all'",
  'categories?': 'string[]',
  'tags?': 'string[]',
  'dateRange?': {
    from: 'Date',
    to: 'Date',
  },
  'readingTime?': {
    min: 'number',
    'max?': 'number',
  },
  'authorId?': 'string',
  'organizationId?': 'string',
  'sortBy?': "'relevance' | 'date' | 'views' | 'engagement'",
  'sortOrder?': "'asc' | 'desc'",
});

const SearchContentInput = type({
  query: 'string > 0 <= 200',
  'filters?': SearchFiltersType,
  'limit?': 'number <= 100',
  'offset?': 'number >= 0',
});

export const searchContent = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = SearchContentInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return {
      ...result,
      query: result.query.trim(),
      limit: Math.min(result.limit || 20, 100),
      offset: result.offset || 0,
      filters: result.filters || {},
    };
  })
  .handler(async ({ query, filters, limit, offset }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });
    const startTime = Date.now();

    const {
      contentType = 'posts',
      categories = [],
      tags = [],
      dateRange,
      readingTime,
      authorId,
      organizationId,
      sortBy = 'relevance',
      sortOrder = 'desc',
    } = filters;

    let results = [];
    let totalCount = 0;

    if (contentType === 'posts' || contentType === 'all') {
      const postsResult = await searchPosts({
        query,
        categories,
        tags,
        dateRange,
        readingTime,
        authorId,
        organizationId,
        sortBy,
        sortOrder,
        limit: contentType === 'posts' ? limit : Math.floor(limit / 3),
        offset: contentType === 'posts' ? offset : 0,
      });

      results.push(...postsResult.results);
      totalCount += postsResult.totalCount;
    }

    if (contentType === 'users' || contentType === 'all') {
      const usersResult = await searchUsers({
        query,
        organizationId,
        limit: contentType === 'users' ? limit : Math.floor(limit / 3),
        offset: contentType === 'users' ? offset : 0,
      });

      results.push(...usersResult.results);
      totalCount += usersResult.totalCount;
    }

    if (contentType === 'organizations' || contentType === 'all') {
      const orgsResult = await searchOrganizations({
        query,
        limit: contentType === 'organizations' ? limit : Math.floor(limit / 3),
        offset: contentType === 'organizations' ? offset : 0,
      });

      results.push(...orgsResult.results);
      totalCount += orgsResult.totalCount;
    }

    // Log search analytics
    const responseTime = Date.now() - startTime;
    await logSearchQuery({
      query,
      userId: session?.user?.id,
      organizationId,
      resultCount: totalCount,
      responseTimeMs: responseTime,
      contentType,
      filters,
      ipAddress: headers.get('x-forwarded-for') || 'unknown',
      userAgent: headers.get('user-agent') || 'unknown',
    });

    return {
      query,
      results,
      totalCount,
      responseTime,
      filters,
    };
  });

async function searchPosts({
  query,
  categories,
  tags,
  dateRange,
  readingTime,
  authorId,
  organizationId,
  sortBy,
  sortOrder,
  limit,
  offset,
}: {
  query: string;
  categories: string[];
  tags: string[];
  dateRange?: { from: Date; to: Date };
  readingTime?: { min: number; max?: number };
  authorId?: string;
  organizationId?: string;
  sortBy: string;
  sortOrder: string;
  limit: number;
  offset: number;
}) {
  let whereConditions = [eq(posts.status, 'published')];

  // Author filter
  if (authorId) {
    whereConditions.push(eq(posts.authorId, authorId));
  }

  // Organization filter
  if (organizationId) {
    whereConditions.push(eq(posts.organizationId, organizationId));
  }

  // Date range filter
  if (dateRange) {
    whereConditions.push(
      and(
        gte(posts.publishedAt, dateRange.from),
        lte(posts.publishedAt, dateRange.to),
      ),
    );
  }

  // Reading time filter
  if (readingTime) {
    if (readingTime.max) {
      whereConditions.push(
        and(
          gte(posts.readingTime, readingTime.min),
          lte(posts.readingTime, readingTime.max),
        ),
      );
    } else {
      whereConditions.push(gte(posts.readingTime, readingTime.min));
    }
  }

  // Category filter
  if (categories.length > 0) {
    whereConditions.push(
      inArray(
        posts.id,
        db
          .select({ postId: postCategories.postId })
          .from(postCategories)
          .where(inArray(postCategories.categoryId, categories)),
      ),
    );
  }

  // Tags filter
  if (tags.length > 0) {
    whereConditions.push(
      inArray(
        posts.id,
        db
          .select({ postId: postTags.postId })
          .from(postTags)
          .where(inArray(postTags.tag, tags)),
      ),
    );
  }

  // Full-text search with ranking
  const searchResults = await db.execute(sql`
    SELECT 
      p.*,
      u.name as author_name,
      u.username as author_username,
      u.avatar as author_avatar,
      o.name as organization_name,
      o.slug as organization_slug,
      ts_rank(
        to_tsvector('english', p.title || ' ' || p.content),
        plainto_tsquery('english', ${query})
      ) as search_rank,
      ts_headline(
        'english',
        p.content,
        plainto_tsquery('english', ${query}),
        'MaxWords=50, MinWords=10, MaxFragments=1'
      ) as excerpt_highlight,
      'post' as result_type
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 
      p.status = 'published'
      ${authorId ? sql`AND p.author_id = ${authorId}` : sql``}
      ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
      ${
        dateRange
          ? sql`AND p.published_at BETWEEN ${dateRange.from} AND ${dateRange.to}`
          : sql``
      }
      ${
        readingTime
          ? readingTime.max
            ? sql`AND p.reading_time BETWEEN ${readingTime.min} AND ${readingTime.max}`
            : sql`AND p.reading_time >= ${readingTime.min}`
          : sql``
      }
      ${
        categories.length > 0
          ? sql`AND p.id IN (
              SELECT pc.post_id FROM post_categories pc 
              WHERE pc.category_id = ANY(${categories})
            )`
          : sql``
      }
      ${
        tags.length > 0
          ? sql`AND p.id IN (
              SELECT pt.post_id FROM post_tags pt 
              WHERE pt.tag = ANY(${tags})
            )`
          : sql``
      }
      AND (
        to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
        OR p.title ILIKE '%' || ${query} || '%'
      )
    ORDER BY
      ${
        sortBy === 'relevance'
          ? sql`search_rank DESC, p.published_at DESC`
          : sortBy === 'date'
            ? sql`p.published_at ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`
            : sortBy === 'views'
              ? sql`p.view_count ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`
              : sql`(p.view_count + p.like_count + p.comment_count) ${
                  sortOrder === 'desc' ? sql`DESC` : sql`ASC`
                }`
      }
    LIMIT ${limit} OFFSET ${offset}
  `);

  // Get total count
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as total
    FROM posts p
    WHERE 
      p.status = 'published'
      ${authorId ? sql`AND p.author_id = ${authorId}` : sql``}
      ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
      ${
        dateRange
          ? sql`AND p.published_at BETWEEN ${dateRange.from} AND ${dateRange.to}`
          : sql``
      }
      ${
        readingTime
          ? readingTime.max
            ? sql`AND p.reading_time BETWEEN ${readingTime.min} AND ${readingTime.max}`
            : sql`AND p.reading_time >= ${readingTime.min}`
          : sql``
      }
      ${
        categories.length > 0
          ? sql`AND p.id IN (
              SELECT pc.post_id FROM post_categories pc 
              WHERE pc.category_id = ANY(${categories})
            )`
          : sql``
      }
      ${
        tags.length > 0
          ? sql`AND p.id IN (
              SELECT pt.post_id FROM post_tags pt 
              WHERE pt.tag = ANY(${tags})
            )`
          : sql``
      }
      AND (
        to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
        OR p.title ILIKE '%' || ${query} || '%'
      )
  `);

  return {
    results: searchResults,
    totalCount: countResult[0]?.total || 0,
  };
}

async function searchUsers({
  query,
  organizationId,
  limit,
  offset,
}: {
  query: string;
  organizationId?: string;
  limit: number;
  offset: number;
}) {
  const searchResults = await db.execute(sql`
    SELECT 
      u.id,
      u.username,
      u.name,
      u.avatar,
      u.bio,
      u.location,
      u.follower_count,
      u.posts_count,
      'user' as result_type,
      CASE 
        WHEN u.username ILIKE ${query} THEN 3
        WHEN u.name ILIKE ${query} THEN 2
        WHEN u.username ILIKE '%' || ${query} || '%' THEN 1
        ELSE 0
      END as search_rank
    FROM users u
    ${
      organizationId
        ? sql`
          JOIN organization_members om ON om.user_id = u.id
          WHERE om.organization_id = ${organizationId}
            AND (
              u.name ILIKE '%' || ${query} || '%' 
              OR u.username ILIKE '%' || ${query} || '%'
              OR u.bio ILIKE '%' || ${query} || '%'
            )
        `
        : sql`
          WHERE 
            u.name ILIKE '%' || ${query} || '%' 
            OR u.username ILIKE '%' || ${query} || '%'
            OR u.bio ILIKE '%' || ${query} || '%'
        `
    }
    ORDER BY search_rank DESC, u.follower_count DESC, u.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `);

  const countResult = await db.execute(sql`
    SELECT COUNT(*) as total
    FROM users u
    ${
      organizationId
        ? sql`
          JOIN organization_members om ON om.user_id = u.id
          WHERE om.organization_id = ${organizationId}
            AND (
              u.name ILIKE '%' || ${query} || '%' 
              OR u.username ILIKE '%' || ${query} || '%'
              OR u.bio ILIKE '%' || ${query} || '%'
            )
        `
        : sql`
          WHERE 
            u.name ILIKE '%' || ${query} || '%' 
            OR u.username ILIKE '%' || ${query} || '%'
            OR u.bio ILIKE '%' || ${query} || '%'
        `
    }
  `);

  return {
    results: searchResults,
    totalCount: countResult[0]?.total || 0,
  };
}

async function searchOrganizations({
  query,
  limit,
  offset,
}: {
  query: string;
  limit: number;
  offset: number;
}) {
  const searchResults = await db.execute(sql`
    SELECT 
      o.id,
      o.name,
      o.slug,
      o.description,
      o.avatar,
      o.website,
      COUNT(om.id) as member_count,
      COUNT(p.id) as post_count,
      'organization' as result_type,
      CASE 
        WHEN o.name ILIKE ${query} THEN 3
        WHEN o.slug ILIKE ${query} THEN 2
        WHEN o.name ILIKE '%' || ${query} || '%' THEN 1
        ELSE 0
      END as search_rank
    FROM organizations o
    LEFT JOIN organization_members om ON om.organization_id = o.id
    LEFT JOIN posts p ON p.organization_id = o.id AND p.status = 'published'
    WHERE 
      o.name ILIKE '%' || ${query} || '%' 
      OR o.slug ILIKE '%' || ${query} || '%'
      OR o.description ILIKE '%' || ${query} || '%'
    GROUP BY o.id, o.name, o.slug, o.description, o.avatar, o.website
    ORDER BY search_rank DESC, member_count DESC, o.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `);

  const countResult = await db.execute(sql`
    SELECT COUNT(*) as total
    FROM organizations o
    WHERE 
      o.name ILIKE '%' || ${query} || '%' 
      OR o.slug ILIKE '%' || ${query} || '%'
      OR o.description ILIKE '%' || ${query} || '%'
  `);

  return {
    results: searchResults,
    totalCount: countResult[0]?.total || 0,
  };
}

async function logSearchQuery({
  query,
  userId,
  organizationId,
  resultCount,
  responseTimeMs,
  contentType,
  filters,
  ipAddress,
  userAgent,
}: {
  query: string;
  userId?: string;
  organizationId?: string;
  resultCount: number;
  responseTimeMs: number;
  contentType: string;
  filters: any;
  ipAddress: string;
  userAgent: string;
}) {
  try {
    await db.insert(searchQueries).values({
      id: nanoid(),
      query,
      userId,
      organizationId,
      resultCount,
      responseTimeMs,
      contentType,
      filters,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to log search query:', error);
    // Don't throw - analytics shouldn't break search
  }
}
```

### 2. Advanced Filtering and Faceted Search

Provide dynamic filtering options based on content metadata.

```typescript
// src/modules/search/api/search-facets.ts
import { createServerFn } from '@tanstack/react-start';
import { eq, and, gte, lte, inArray, count, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  posts,
  categories,
  postCategories,
  postTags,
  users,
  organizations,
} from '@/lib/db/schemas';

export const getSearchFacets = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      query?: string;
      contentType?: 'posts' | 'users' | 'organizations';
      organizationId?: string;
    }) => data,
  )
  .handler(async ({ query, contentType = 'posts', organizationId }) => {
    const facets: Record<string, any> = {};

    if (contentType === 'posts') {
      // Get available categories with post counts
      facets.categories = await db.execute(sql`
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.color,
          c.icon,
          COUNT(DISTINCT p.id) as post_count
        FROM categories c
        LEFT JOIN post_categories pc ON pc.category_id = c.id
        LEFT JOIN posts p ON p.id = pc.post_id 
          AND p.status = 'published'
          ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
          ${
            query
              ? sql`AND (
                  to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
                  OR p.title ILIKE '%' || ${query} || '%'
                )`
              : sql``
          }
        WHERE c.is_active = true
        GROUP BY c.id, c.name, c.slug, c.color, c.icon
        HAVING COUNT(DISTINCT p.id) > 0
        ORDER BY post_count DESC, c.name ASC
        LIMIT 20
      `);

      // Get popular tags
      facets.tags = await db.execute(sql`
        SELECT 
          pt.tag,
          COUNT(DISTINCT p.id) as post_count
        FROM post_tags pt
        JOIN posts p ON p.id = pt.post_id 
        WHERE p.status = 'published'
          ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
          ${
            query
              ? sql`AND (
                  to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
                  OR p.title ILIKE '%' || ${query} || '%'
                )`
              : sql``
          }
        GROUP BY pt.tag
        HAVING COUNT(DISTINCT p.id) >= 2
        ORDER BY post_count DESC, pt.tag ASC
        LIMIT 30
      `);

      // Get reading time ranges
      facets.readingTime = [
        { label: '< 5 min', min: 0, max: 4, value: '0-4' },
        { label: '5-10 min', min: 5, max: 10, value: '5-10' },
        { label: '10-20 min', min: 11, max: 20, value: '11-20' },
        { label: '20+ min', min: 21, value: '21+' },
      ];

      // Get active authors
      facets.authors = await db.execute(sql`
        SELECT 
          u.id,
          u.name,
          u.username,
          u.avatar,
          COUNT(DISTINCT p.id) as post_count
        FROM users u
        JOIN posts p ON p.author_id = u.id
        WHERE p.status = 'published'
          AND p.published_at > NOW() - INTERVAL '6 months'
          ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
          ${
            query
              ? sql`AND (
                  to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
                  OR p.title ILIKE '%' || ${query} || '%'
                )`
              : sql``
          }
        GROUP BY u.id, u.name, u.username, u.avatar
        HAVING COUNT(DISTINCT p.id) >= 2
        ORDER BY post_count DESC, u.name ASC
        LIMIT 15
      `);

      // Get date ranges with counts
      facets.dateRanges = await db.execute(sql`
        SELECT 
          'Last 24 hours' as label,
          '24h' as value,
          COUNT(*) as post_count
        FROM posts p
        WHERE p.status = 'published'
          AND p.published_at > NOW() - INTERVAL '24 hours'
          ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
          ${
            query
              ? sql`AND (
                  to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
                  OR p.title ILIKE '%' || ${query} || '%'
                )`
              : sql``
          }
        
        UNION ALL
        
        SELECT 
          'Last week' as label,
          '7d' as value,
          COUNT(*) as post_count
        FROM posts p
        WHERE p.status = 'published'
          AND p.published_at > NOW() - INTERVAL '7 days'
          ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
          ${
            query
              ? sql`AND (
                  to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
                  OR p.title ILIKE '%' || ${query} || '%'
                )`
              : sql``
          }
        
        UNION ALL
        
        SELECT 
          'Last month' as label,
          '30d' as value,
          COUNT(*) as post_count
        FROM posts p
        WHERE p.status = 'published'
          AND p.published_at > NOW() - INTERVAL '30 days'
          ${organizationId ? sql`AND p.organization_id = ${organizationId}` : sql``}
          ${
            query
              ? sql`AND (
                  to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
                  OR p.title ILIKE '%' || ${query} || '%'
                )`
              : sql``
          }
        
        ORDER BY CASE value 
          WHEN '24h' THEN 1 
          WHEN '7d' THEN 2 
          WHEN '30d' THEN 3 
        END
      `);
    }

    return {
      contentType,
      query,
      facets,
    };
  });
```

### 3. Search Suggestions and Autocomplete

Provide real-time search suggestions based on content and user behavior.

```typescript
// src/modules/search/api/search-suggestions.ts
import { createServerFn } from '@tanstack/react-start';
import { ilike, or, desc, limit as limitQuery } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  posts,
  users,
  organizations,
  categories,
  postTags,
  searchQueries,
} from '@/lib/db/schemas';

export const getSearchSuggestions = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      query: string;
      contentType?: 'posts' | 'users' | 'organizations' | 'all';
      limit?: number;
    }) => {
      if (!data.query || data.query.trim().length < 2) {
        return { ...data, query: '', suggestions: [] };
      }
      return {
        ...data,
        query: data.query.trim(),
        contentType: data.contentType || 'all',
        limit: Math.min(data.limit || 10, 20),
      };
    },
  )
  .handler(async ({ query, contentType, limit }) => {
    if (!query) {
      return { query: '', suggestions: [] };
    }

    const suggestions: Array<{
      text: string;
      type: string;
      category?: string;
      count?: number;
      metadata?: any;
    }> = [];

    // Get title suggestions from posts
    if (contentType === 'posts' || contentType === 'all') {
      const titleSuggestions = await db
        .select({
          title: posts.title,
          id: posts.id,
          viewCount: posts.viewCount,
        })
        .from(posts)
        .where(
          and(eq(posts.status, 'published'), ilike(posts.title, `%${query}%`)),
        )
        .orderBy(desc(posts.viewCount))
        .limit(Math.floor(limit / 3));

      titleSuggestions.forEach((post) => {
        suggestions.push({
          text: post.title,
          type: 'post_title',
          category: 'Posts',
          count: post.viewCount,
          metadata: { id: post.id },
        });
      });
    }

    // Get user suggestions
    if (contentType === 'users' || contentType === 'all') {
      const userSuggestions = await db
        .select({
          name: users.name,
          username: users.username,
          id: users.id,
          followerCount: users.followerCount,
        })
        .from(users)
        .where(
          or(
            ilike(users.name, `%${query}%`),
            ilike(users.username, `%${query}%`),
          ),
        )
        .orderBy(desc(users.followerCount))
        .limit(Math.floor(limit / 3));

      userSuggestions.forEach((user) => {
        suggestions.push({
          text: user.name,
          type: 'user_name',
          category: 'Users',
          count: user.followerCount,
          metadata: { id: user.id, username: user.username },
        });
      });
    }

    // Get organization suggestions
    if (contentType === 'organizations' || contentType === 'all') {
      const orgSuggestions = await db
        .select({
          name: organizations.name,
          id: organizations.id,
          slug: organizations.slug,
        })
        .from(organizations)
        .where(
          or(
            ilike(organizations.name, `%${query}%`),
            ilike(organizations.slug, `%${query}%`),
          ),
        )
        .orderBy(organizations.name)
        .limit(Math.floor(limit / 3));

      orgSuggestions.forEach((org) => {
        suggestions.push({
          text: org.name,
          type: 'organization_name',
          category: 'Organizations',
          metadata: { id: org.id, slug: org.slug },
        });
      });
    }

    // Get category suggestions
    const categorySuggestions = await db
      .select({
        name: categories.name,
        id: categories.id,
        postCount: categories.postCount,
      })
      .from(categories)
      .where(
        and(
          eq(categories.isActive, true),
          ilike(categories.name, `%${query}%`),
        ),
      )
      .orderBy(desc(categories.postCount))
      .limit(3);

    categorySuggestions.forEach((category) => {
      suggestions.push({
        text: category.name,
        type: 'category',
        category: 'Categories',
        count: category.postCount,
        metadata: { id: category.id },
      });
    });

    // Get popular tag suggestions
    const tagSuggestions = await db.execute(sql`
      SELECT 
        pt.tag,
        COUNT(DISTINCT p.id) as post_count
      FROM post_tags pt
      JOIN posts p ON p.id = pt.post_id
      WHERE p.status = 'published'
        AND pt.tag ILIKE '%' || ${query} || '%'
      GROUP BY pt.tag
      HAVING COUNT(DISTINCT p.id) >= 2
      ORDER BY post_count DESC
      LIMIT 3
    `);

    tagSuggestions.forEach((tag: any) => {
      suggestions.push({
        text: tag.tag,
        type: 'tag',
        category: 'Tags',
        count: tag.post_count,
      });
    });

    // Get popular historical queries
    const historicalQueries = await db
      .select({
        query: searchQueries.query,
        resultCount: searchQueries.resultCount,
      })
      .from(searchQueries)
      .where(
        and(
          ilike(searchQueries.query, `%${query}%`),
          sql`${searchQueries.resultCount} > 0`,
        ),
      )
      .orderBy(desc(searchQueries.createdAt))
      .limit(2);

    historicalQueries.forEach((hq) => {
      if (
        !suggestions.find(
          (s) => s.text.toLowerCase() === hq.query.toLowerCase(),
        )
      ) {
        suggestions.push({
          text: hq.query,
          type: 'historical_query',
          category: 'Recent Searches',
          count: hq.resultCount,
        });
      }
    });

    return {
      query,
      suggestions: suggestions.slice(0, limit),
    };
  });

export const recordSearchClick = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      query: string;
      resultId: string;
      resultType: 'post' | 'user' | 'organization';
      position: number;
    }) => data,
  )
  .handler(async ({ query, resultId, resultType, position }) => {
    // Update search query record with click information
    await db.execute(sql`
      UPDATE search_queries 
      SET 
        clicked_result_id = ${resultId},
        clicked_result_type = ${resultType},
        clicked_position = ${position}
      WHERE query = ${query}
        AND clicked_result_id IS NULL
        AND created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    return { success: true };
  });
```

### 4. Content Discovery and Recommendations

Personalized content discovery based on user behavior and preferences.

```typescript
// src/modules/search/api/content-discovery.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and, desc, inArray, not, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  posts,
  users,
  userFollows,
  postViews,
  postCategories,
  postTags,
  searchQueries,
} from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

export const getDiscoveryFeed = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      algorithm?: 'trending' | 'personalized' | 'similar' | 'popular';
      timeframe?: '24h' | '7d' | '30d';
      limit?: number;
      offset?: number;
    }) => ({
      ...data,
      algorithm: data.algorithm || 'trending',
      timeframe: data.timeframe || '7d',
      limit: Math.min(data.limit || 20, 50),
      offset: data.offset || 0,
    }),
  )
  .handler(async ({ algorithm, timeframe, limit, offset }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    switch (algorithm) {
      case 'trending':
        return getTrendingContent(timeframe, limit, offset);
      case 'personalized':
        return getPersonalizedContent(
          session?.user?.id,
          timeframe,
          limit,
          offset,
        );
      case 'similar':
        return getSimilarContent(session?.user?.id, limit, offset);
      case 'popular':
        return getPopularContent(timeframe, limit, offset);
      default:
        return getTrendingContent(timeframe, limit, offset);
    }
  });

async function getTrendingContent(
  timeframe: string,
  limit: number,
  offset: number,
) {
  const timeframeHours = {
    '24h': 24,
    '7d': 168,
    '30d': 720,
  }[timeframe];

  const trendingPosts = await db.execute(sql`
    SELECT 
      p.*,
      u.name as author_name,
      u.username as author_username,
      u.avatar as author_avatar,
      o.name as organization_name,
      o.slug as organization_slug,
      (
        (p.view_count * 0.1) +
        (p.like_count * 1.0) +
        (p.comment_count * 2.0) +
        (p.share_count * 3.0) +
        -- Time decay factor (more recent = higher score)
        (EXTRACT(EPOCH FROM (NOW() - p.published_at)) / 3600.0 / ${timeframeHours} * -5.0) +
        -- Velocity factor (views per hour since publication)
        CASE 
          WHEN EXTRACT(EPOCH FROM (NOW() - p.published_at)) / 3600.0 > 0 
          THEN (p.view_count / GREATEST(EXTRACT(EPOCH FROM (NOW() - p.published_at)) / 3600.0, 1)) * 0.5
          ELSE 0 
        END
      ) as trending_score
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 
      p.status = 'published' 
      AND p.published_at > NOW() - INTERVAL '${timeframeHours} hours'
      AND p.published_at <= NOW()
    ORDER BY trending_score DESC, p.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    algorithm: 'trending',
    posts: trendingPosts,
    hasMore: trendingPosts.length === limit,
  };
}

async function getPersonalizedContent(
  userId: string | undefined,
  timeframe: string,
  limit: number,
  offset: number,
) {
  if (!userId) {
    return getTrendingContent(timeframe, limit, offset);
  }

  // Get user's interests based on reading history and follows
  const userInterests = await db.execute(sql`
    WITH user_categories AS (
      SELECT 
        pc.category_id,
        COUNT(*) as interest_score
      FROM post_views pv
      JOIN post_categories pc ON pc.post_id = pv.post_id
      WHERE pv.user_id = ${userId}
        AND pv.viewed_at > NOW() - INTERVAL '30 days'
      GROUP BY pc.category_id
      ORDER BY interest_score DESC
      LIMIT 10
    ),
    following_categories AS (
      SELECT 
        pc.category_id,
        COUNT(*) as follow_score
      FROM user_follows uf
      JOIN posts p ON p.author_id = uf.following_id
      JOIN post_categories pc ON pc.post_id = p.id
      WHERE uf.follower_id = ${userId}
        AND p.published_at > NOW() - INTERVAL '30 days'
      GROUP BY pc.category_id
      ORDER BY follow_score DESC
      LIMIT 10
    )
    SELECT 
      p.*,
      u.name as author_name,
      u.username as author_username,
      u.avatar as author_avatar,
      o.name as organization_name,
      o.slug as organization_slug,
      (
        -- Base engagement score
        (p.view_count * 0.1) + (p.like_count * 1.0) + (p.comment_count * 2.0) +
        -- Interest category boost
        CASE WHEN EXISTS(
          SELECT 1 FROM post_categories pc2 
          WHERE pc2.post_id = p.id 
            AND pc2.category_id IN (SELECT category_id FROM user_categories)
        ) THEN 5.0 ELSE 0.0 END +
        -- Following author boost  
        CASE WHEN EXISTS(
          SELECT 1 FROM user_follows uf2
          WHERE uf2.follower_id = ${userId} AND uf2.following_id = p.author_id
        ) THEN 3.0 ELSE 0.0 END +
        -- Recency boost
        (EXTRACT(EPOCH FROM (NOW() - p.published_at)) / 3600.0 * -0.1)
      ) as personalization_score
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 
      p.status = 'published'
      AND p.published_at > NOW() - INTERVAL '30 days'
      AND p.author_id != ${userId}  -- Exclude own posts
      AND NOT EXISTS(
        SELECT 1 FROM post_views pv 
        WHERE pv.post_id = p.id AND pv.user_id = ${userId}
      )  -- Exclude already viewed
    ORDER BY personalization_score DESC, p.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    algorithm: 'personalized',
    posts: userInterests,
    hasMore: userInterests.length === limit,
  };
}

async function getSimilarContent(
  userId: string | undefined,
  limit: number,
  offset: number,
) {
  if (!userId) {
    return getPopularContent('7d', limit, offset);
  }

  // Find content similar to what user has recently engaged with
  const similarPosts = await db.execute(sql`
    WITH recent_engagement AS (
      SELECT DISTINCT p.id as engaged_post_id
      FROM posts p
      LEFT JOIN post_views pv ON pv.post_id = p.id AND pv.user_id = ${userId}
      WHERE (pv.viewed_at > NOW() - INTERVAL '7 days')
        AND p.status = 'published'
      ORDER BY COALESCE(pv.viewed_at, p.published_at) DESC
      LIMIT 10
    ),
    engaged_categories AS (
      SELECT pc.category_id, COUNT(*) as frequency
      FROM recent_engagement re
      JOIN post_categories pc ON pc.post_id = re.engaged_post_id
      GROUP BY pc.category_id
    ),
    engaged_tags AS (
      SELECT pt.tag, COUNT(*) as frequency
      FROM recent_engagement re
      JOIN post_tags pt ON pt.post_id = re.engaged_post_id
      GROUP BY pt.tag
    )
    SELECT 
      p.*,
      u.name as author_name,
      u.username as author_username,
      u.avatar as author_avatar,
      o.name as organization_name,
      o.slug as organization_slug,
      (
        -- Category similarity score
        COALESCE((
          SELECT SUM(ec.frequency) 
          FROM engaged_categories ec
          JOIN post_categories pc ON pc.category_id = ec.category_id
          WHERE pc.post_id = p.id
        ), 0) * 2.0 +
        -- Tag similarity score
        COALESCE((
          SELECT SUM(et.frequency)
          FROM engaged_tags et
          JOIN post_tags pt ON pt.tag = et.tag
          WHERE pt.post_id = p.id
        ), 0) * 1.0 +
        -- Base engagement
        (p.view_count * 0.1) + (p.like_count * 0.5)
      ) as similarity_score
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 
      p.status = 'published'
      AND p.published_at > NOW() - INTERVAL '30 days'
      AND p.author_id != ${userId}
      AND p.id NOT IN (SELECT engaged_post_id FROM recent_engagement)
      AND NOT EXISTS(
        SELECT 1 FROM post_views pv 
        WHERE pv.post_id = p.id AND pv.user_id = ${userId}
      )
    HAVING similarity_score > 0
    ORDER BY similarity_score DESC, p.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    algorithm: 'similar',
    posts: similarPosts,
    hasMore: similarPosts.length === limit,
  };
}

async function getPopularContent(
  timeframe: string,
  limit: number,
  offset: number,
) {
  const timeframeHours = {
    '24h': 24,
    '7d': 168,
    '30d': 720,
  }[timeframe];

  const popularPosts = await db.execute(sql`
    SELECT 
      p.*,
      u.name as author_name,
      u.username as author_username,
      u.avatar as author_avatar,
      o.name as organization_name,
      o.slug as organization_slug,
      (p.view_count + p.like_count * 2 + p.comment_count * 3 + p.share_count * 4) as popularity_score
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE 
      p.status = 'published'
      AND p.published_at > NOW() - INTERVAL '${timeframeHours} hours'
    ORDER BY popularity_score DESC, p.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    algorithm: 'popular',
    posts: popularPosts,
    hasMore: popularPosts.length === limit,
  };
}
```

## React Query Integration

### Query Options and Hooks

```typescript
// src/modules/search/hooks/use-search-queries.ts
import {
  queryOptions,
  useQuery,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  searchContent,
  getSearchFacets,
  getSearchSuggestions,
  getDiscoveryFeed,
} from '@/modules/search/api';

export const searchQueries = {
  all: () => ['search'] as const,

  // Main search
  search: (query: string, filters: any = {}) =>
    queryOptions({
      queryKey: [...searchQueries.all(), 'results', query, filters] as const,
      queryFn: ({ pageParam = 0 }) =>
        searchContent({ query, filters, offset: pageParam * 20 }),
      enabled: query.length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),

  // Search facets
  facets: (query?: string, contentType?: string, organizationId?: string) =>
    queryOptions({
      queryKey: [
        ...searchQueries.all(),
        'facets',
        query,
        contentType,
        organizationId,
      ] as const,
      queryFn: () => getSearchFacets({ query, contentType, organizationId }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  // Suggestions
  suggestions: (query: string, contentType?: string) =>
    queryOptions({
      queryKey: [
        ...searchQueries.all(),
        'suggestions',
        query,
        contentType,
      ] as const,
      queryFn: () => getSearchSuggestions({ query, contentType }),
      enabled: query.length >= 2,
      staleTime: 1 * 60 * 1000, // 1 minute
    }),

  // Discovery
  discovery: (algorithm: string, timeframe: string) =>
    queryOptions({
      queryKey: [
        ...searchQueries.all(),
        'discovery',
        algorithm,
        timeframe,
      ] as const,
      queryFn: ({ pageParam = 0 }) =>
        getDiscoveryFeed({
          algorithm,
          timeframe,
          offset: pageParam * 20,
        }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

// Custom hooks with object parameters
export function useSearch({
  query,
  filters = {},
  enabled = true,
}: {
  query: string;
  filters?: any;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    ...searchQueries.search(query, filters),
    enabled: enabled && query.length > 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.results.length === 20 ? pages.length : undefined,
  });
}

export function useSearchFacets({
  query,
  contentType,
  organizationId,
}: {
  query?: string;
  contentType?: string;
  organizationId?: string;
} = {}) {
  return useQuery(searchQueries.facets(query, contentType, organizationId));
}

export function useSearchSuggestions({
  query,
  contentType,
  enabled = true,
}: {
  query: string;
  contentType?: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...searchQueries.suggestions(query, contentType),
    enabled: enabled && query.length >= 2,
  });
}

export function useDiscoveryFeed({
  algorithm = 'trending',
  timeframe = '7d',
}: {
  algorithm?: 'trending' | 'personalized' | 'similar' | 'popular';
  timeframe?: '24h' | '7d' | '30d';
} = {}) {
  return useInfiniteQuery({
    ...searchQueries.discovery(algorithm, timeframe),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined,
  });
}
```

## Frontend Component Patterns

### Advanced Search Interface

```typescript
// src/components/search/advanced-search.tsx
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useSearch, useSearchFacets, useSearchSuggestions } from '@/modules/search/hooks/use-search-queries';

interface AdvancedSearchProps {
  onResults?: (results: any[]) => void;
  className?: string;
}

export function AdvancedSearch({ onResults, className }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<any>({
    contentType: 'posts',
    categories: [],
    tags: [],
    readingTime: undefined,
    dateRange: undefined,
    sortBy: 'relevance',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [debouncedQuery] = useDebounce(query, 300);

  const {
    data: searchData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isSearching,
  } = useSearch({
    query: debouncedQuery,
    filters,
    enabled: debouncedQuery.length > 0,
  });

  const { data: facets } = useSearchFacets({
    query: debouncedQuery,
    contentType: filters.contentType,
  });

  const { data: suggestions } = useSearchSuggestions({
    query,
    contentType: filters.contentType,
    enabled: showSuggestions && query.length >= 2,
  });

  const results = searchData?.pages.flatMap(page => page.results) || [];

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setFilters((prev: any) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id: string) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFilters((prev: any) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const handleSuggestionClick = useCallback((suggestion: any) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      contentType: 'posts',
      categories: [],
      tags: [],
      readingTime: undefined,
      dateRange: undefined,
      sortBy: 'relevance',
    });
  }, []);

  return (
    <div className={className}>
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for posts, users, or organizations..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length >= 2);
            }}
            onFocus={() => setShowSuggestions(query.length >= 2)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-4 py-3 text-lg"
          />
          {isSearching && (
            <Icons.spinner className="absolute right-3 top-1/2 transform -translate-y-1/2 size-4 animate-spin" />
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions?.suggestions && suggestions.suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-2">
              {suggestions.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{suggestion.text}</div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.category}
                    </div>
                  </div>
                  {suggestion.count && (
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.count}
                    </Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select
                  value={filters.contentType}
                  onValueChange={(value) => handleFilterChange('contentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="organizations">Organizations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              {facets?.facets?.categories && facets.facets.categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Categories</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {facets.facets.categories.map((category: any) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {category.name}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {category.post_count}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {facets?.facets?.tags && facets.facets.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Popular Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {facets.facets.tags.slice(0, 15).map((tag: any) => (
                      <Badge
                        key={tag.tag}
                        variant={filters.tags.includes(tag.tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleTagToggle(tag.tag)}
                      >
                        {tag.tag} ({tag.post_count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reading Time */}
              {facets?.facets?.readingTime && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Reading Time</label>
                  <div className="space-y-2">
                    {facets.facets.readingTime.map((range: any) => (
                      <div key={range.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`time-${range.value}`}
                          checked={filters.readingTime === range.value}
                          onCheckedChange={(checked) =>
                            handleFilterChange('readingTime', checked ? range.value : undefined)
                          }
                        />
                        <label
                          htmlFor={`time-${range.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {range.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {debouncedQuery && searchData && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Found {searchData.pages[0]?.totalCount || 0} results for "{debouncedQuery}"
                {searchData.pages[0]?.responseTime && (
                  <span> in {searchData.pages[0].responseTime}ms</span>
                )}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((result) => (
              <SearchResultCard
                key={`${result.result_type}-${result.id}`}
                result={result}
                query={debouncedQuery}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Load more results
              </Button>
            </div>
          )}

          {debouncedQuery && !isSearching && results.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Icons.search className="size-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Performance Optimization

1. **PostgreSQL Full-Text Search** - Native database search with proper indexing
2. **Debounced Queries** - Prevent excessive API calls during typing
3. **Result Caching** - Smart cache invalidation with appropriate stale times
4. **Search Analytics** - Track performance and user behavior for optimization
5. **Faceted Search** - Pre-computed facets for fast filtering

## Security Considerations

1. **Query Validation** - Length limits and sanitization
2. **Rate Limiting** - Prevent search abuse
3. **Privacy Filters** - Respect content visibility settings
4. **SQL Injection Prevention** - Parameterized queries via Drizzle ORM
5. **Search Analytics Privacy** - Anonymous tracking with IP hashing

## Integration Points

- **Authentication**: Personalized search based on user context
- **Database**: Leverages existing content and relationship tables
- **Analytics**: Comprehensive search behavior tracking
- **Content System**: Full integration with posts, categories, and tags
- **Social Features**: User and organization discovery

This implementation guide provides a comprehensive search and discovery system with full-text search, intelligent filtering, personalized recommendations, and detailed analytics, all built on PostgreSQL's powerful search capabilities.
