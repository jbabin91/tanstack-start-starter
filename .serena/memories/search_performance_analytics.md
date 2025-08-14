# Search Performance & Analytics System

## Overview

This document outlines the comprehensive performance monitoring and analytics framework for our TanStack Start search and discovery system, focusing on real-time optimization, user behavior tracking, and data-driven improvements.

**Related Strategic Documents:**

- **[Search UX Strategy](./search_ux_strategy.md)** - User experience design and advanced filtering architecture
- **[Search Discovery Roadmap](./search_discovery_roadmap.md)** - Implementation phases and success metrics
- **[Content Creation System Design](./content_creation_writing_interface_design.md)** - Content workflows that integrate with search

**Technical Implementation:**

- **[Database Architecture](../../docs/architecture/database.md)** - PostgreSQL optimization and performance patterns
- **[Development Guide](../../docs/development/index.md)** - Performance best practices and query optimization
- **[Architecture Overview](../../docs/architecture/index.md)** - System architecture and scalability planning

## Core Performance Optimization Strategies

### Query Performance Monitoring

Comprehensive monitoring system for tracking search query performance and identifying bottlenecks:

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

// Usage example
export const searchContent = withPerformanceMonitoring(
  createServerFn({ method: 'POST' })
    .validator((data: SearchFilters) => data)
    .handler(async (filters: SearchFilters) => {
      // Search implementation with automatic performance tracking
    }),
  'search_content',
);
```

### Real-time Search Optimization

Advanced debouncing and caching strategies for optimal user experience:

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

  // Optimized debounce filter changes
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

  // Search query with caching optimization
  const searchQuery = useQuery({
    ...searchQueries.search(debouncedFilters),
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
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
    // State management
    filters,
    debouncedFilters,
    isTyping,

    // Query state with performance metrics
    results: searchQuery.data?.results || [],
    totalCount: searchQuery.data?.totalCount || 0,
    facets: searchQuery.data?.facets,
    isLoading: searchQuery.isLoading || isTyping,
    isError: searchQuery.isError,
    error: searchQuery.error,

    // Actions with analytics integration
    updateFilters,
    updateQuery,
    clearSearch,
    refetch: searchQuery.refetch,
  };
}
```

### Database Connection Pool Optimization

Dedicated connection pool configuration for high-performance search operations:

```typescript
// src/lib/db/search-connection.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/configs/env';

// Specialized connection pool for search workloads
const searchSql = postgres(env.DATABASE_URL, {
  // Optimized for read-heavy search operations
  max: 15, // Higher connection limit for concurrent searches
  idle_timeout: 30,
  connect_timeout: 10,

  // Disable prepared statements for dynamic search queries
  prepare: false,

  // Advanced connection pooling optimizations
  connection: {
    application_name: 'search-service',
    statement_timeout: '30s', // Prevent long-running queries
    idle_in_transaction_session_timeout: '5s',
  },

  // SSL configuration for production
  ssl: env.NODE_ENV === 'production' ? 'require' : false,
});

export const searchDb = drizzle(searchSql, {
  logger: env.NODE_ENV === 'development',
});

// Connection health monitoring
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

## Comprehensive Analytics Integration

### Sentry Performance Monitoring

Advanced performance tracking and alerting for search operations:

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
  // Track search operation metrics
  Sentry.metrics.increment('search.query.count', 1, {
    tags: {
      operation,
      content_type: filters.contentType?.join(',') || 'all',
      has_query: !!filters.query,
      has_filters: Object.keys(filters).length > 1,
    },
  });

  // Performance latency tracking
  Sentry.metrics.timing('search.query.duration', duration, 'millisecond', {
    tags: {
      operation,
      result_count_bucket: getResultCountBucket(resultCount),
    },
  });

  // Slow query alerting
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

  // Zero results tracking for content gap analysis
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

// Search event tracking system
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

  // Custom event tracking for analytics
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

Comprehensive user behavior tracking and product analytics:

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

    // Content engagement pattern identification
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

## Advanced Analytics Dashboard Queries

### Search Performance Analytics

SQL queries for comprehensive search analytics and business intelligence:

```sql
-- Top performing search queries analysis
SELECT
  query,
  COUNT(*) as search_count,
  AVG(result_count) as avg_results,
  AVG(response_time_ms) as avg_response_time,
  COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) as click_count,
  (COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END)::float / COUNT(*)::float) as ctr
FROM search_queries
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND query IS NOT NULL
  AND query != ''
GROUP BY query
ORDER BY search_count DESC
LIMIT 20;

-- Zero result queries for content gap analysis
SELECT
  query,
  COUNT(*) as zero_result_count,
  MAX(created_at) as last_searched
FROM search_queries
WHERE result_count = 0
  AND created_at >= NOW() - INTERVAL '7 days'
  AND query IS NOT NULL
  AND LENGTH(query) >= 3
GROUP BY query
ORDER BY zero_result_count DESC
LIMIT 10;

-- Hourly search performance monitoring
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as search_count,
  AVG(response_time_ms) as avg_response_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time
FROM search_queries
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;

-- Filter usage popularity analysis
SELECT
  jsonb_object_keys(filters) as filter_key,
  COUNT(*) as usage_count
FROM search_queries
WHERE filters IS NOT NULL
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY filter_key
ORDER BY usage_count DESC;

-- User search behavior patterns
SELECT
  user_id,
  COUNT(*) as total_searches,
  COUNT(DISTINCT query) as unique_queries,
  AVG(result_count) as avg_result_count,
  COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) as total_clicks,
  AVG(EXTRACT(EPOCH FROM (clicked_at - created_at))) as avg_time_to_click
FROM search_queries
WHERE user_id IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
HAVING COUNT(*) >= 5  -- Active searchers only
ORDER BY total_searches DESC
LIMIT 50;

-- Search conversion funnel analysis
WITH search_funnel AS (
  SELECT
    DATE_TRUNC('day', created_at) as search_date,
    COUNT(*) as total_searches,
    COUNT(CASE WHEN result_count > 0 THEN 1 END) as searches_with_results,
    COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) as searches_with_clicks,
    COUNT(CASE WHEN clicked_result_id IS NOT NULL AND clicked_at - created_at < INTERVAL '30 seconds' THEN 1 END) as quick_clicks
  FROM search_queries
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', created_at)
)
SELECT
  search_date,
  total_searches,
  searches_with_results,
  (searches_with_results::float / total_searches::float * 100) as result_rate,
  searches_with_clicks,
  (searches_with_clicks::float / searches_with_results::float * 100) as click_rate,
  quick_clicks,
  (quick_clicks::float / searches_with_clicks::float * 100) as quick_click_rate
FROM search_funnel
ORDER BY search_date DESC;
```

### Content Discovery Analytics

Advanced queries for understanding content discovery patterns:

```sql
-- Most clicked content from search
SELECT
  sr.result_type,
  sr.result_id,
  p.title,
  u.name as author_name,
  COUNT(*) as click_count,
  COUNT(DISTINCT sq.user_id) as unique_clickers,
  AVG(sq.result_count) as avg_search_result_count,
  AVG(sr.position) as avg_position
FROM search_queries sq
JOIN search_results sr ON sq.id = sr.search_query_id
LEFT JOIN posts p ON sr.result_id = p.id AND sr.result_type = 'post'
LEFT JOIN users u ON p.author_id = u.id
WHERE sq.created_at >= NOW() - INTERVAL '7 days'
  AND sr.clicked = true
GROUP BY sr.result_type, sr.result_id, p.title, u.name
ORDER BY click_count DESC
LIMIT 20;

-- Search result position effectiveness
SELECT
  position,
  COUNT(*) as times_shown,
  COUNT(CASE WHEN clicked = true THEN 1 END) as times_clicked,
  (COUNT(CASE WHEN clicked = true THEN 1 END)::float / COUNT(*)::float * 100) as ctr
FROM search_results sr
JOIN search_queries sq ON sr.search_query_id = sq.id
WHERE sq.created_at >= NOW() - INTERVAL '7 days'
GROUP BY position
ORDER BY position;

-- Filter effectiveness analysis
SELECT
  filter_combination,
  COUNT(*) as usage_count,
  AVG(result_count) as avg_results,
  COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) as searches_with_clicks,
  (COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END)::float / COUNT(*)::float * 100) as click_rate
FROM (
  SELECT
    id,
    result_count,
    clicked_result_id,
    ARRAY_TO_STRING(
      ARRAY(SELECT jsonb_object_keys(filters) ORDER BY jsonb_object_keys(filters)),
      ','
    ) as filter_combination
  FROM search_queries
  WHERE filters IS NOT NULL
    AND created_at >= NOW() - INTERVAL '7 days'
) sq
GROUP BY filter_combination
HAVING COUNT(*) >= 10  -- Minimum usage threshold
ORDER BY click_rate DESC;
```

## Performance Monitoring Dashboard

### Key Performance Indicators (KPIs)

**Search Performance Metrics:**

- **Response Time**: 95th percentile < 200ms target
- **Database Query Performance**: Average query time < 50ms
- **Cache Hit Rate**: >80% for repeated searches
- **Error Rate**: <0.1% search operation failures

**User Experience Metrics:**

- **Search Success Rate**: >85% searches return results
- **Click-Through Rate**: >60% searches result in content engagement
- **Filter Adoption**: >40% searches use advanced filters
- **Zero-Result Rate**: <15% searches return no results

**Business Intelligence Metrics:**

- **Content Gap Analysis**: Top 20 zero-result queries reviewed weekly
- **Feature Usage**: Filter and discovery feature adoption rates
- **User Retention**: Search users return 2x more frequently
- **Performance Trends**: Week-over-week search performance analysis

### Real-time Monitoring

**Alerting Configuration:**

```typescript
// Performance threshold alerting
const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 1000, // ms
  HIGH_ERROR_RATE: 0.01, // 1%
  HIGH_ZERO_RESULT_RATE: 0.2, // 20%
  LOW_CACHE_HIT_RATE: 0.6, // 60%
};

// Health check monitoring
const HEALTH_CHECK_INTERVALS = {
  DATABASE: 30000, // 30 seconds
  CACHE: 60000, // 1 minute
  SEARCH_API: 15000, // 15 seconds
};
```

**Dashboard Visualization:**

- Real-time search volume and performance graphs
- Geographic search usage patterns
- Content discovery funnel analysis
- Filter usage heatmaps
- Performance alerting status board

### Optimization Recommendations

**Automated Performance Optimization:**

1. **Query Optimization**: Automatic index recommendations based on query patterns
2. **Cache Strategy**: Dynamic cache TTL adjustment based on content freshness
3. **Load Balancing**: Connection pool sizing based on traffic patterns
4. **Content Recommendations**: Zero-result query analysis for content strategy

**User Experience Optimization:**

1. **Search Suggestions**: Popular query recommendations based on analytics
2. **Filter Improvements**: Usage data-driven filter interface optimization
3. **Result Ranking**: Click-through data incorporated into relevance scoring
4. **Mobile Optimization**: Device-specific performance tuning

This comprehensive performance and analytics system ensures optimal search experience while providing actionable insights for continuous improvement and strategic content planning.
