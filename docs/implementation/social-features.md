# Social Features Implementation Guide

This guide provides complete implementation patterns for social features including user following, discovery, activity feeds, and community interactions, built on the existing database schema.

## Database Foundation (Ready)

The social features system is built on these existing database tables:

```sql
-- User following relationships
user_follows (
  id,
  follower_id,      -- User who is following
  following_id,     -- User being followed
  created_at
)

-- Posts with social metadata ready
posts (
  id,
  title,
  content,
  author_id,
  organization_id,
  status,
  published_at,
  view_count,       -- Ready for social metrics
  like_count,       -- Ready for social metrics
  comment_count,    -- Ready for social metrics
  share_count,      -- Ready for social metrics
  created_at,
  updated_at
)

-- User statistics and social context
users (
  id,
  username,
  name,
  avatar,
  bio,
  location,
  website,
  follower_count,   -- Denormalized for performance
  following_count,  -- Denormalized for performance
  posts_count,      -- Denormalized for performance
  created_at,
  updated_at
)
```

## API Implementation Patterns

### 1. Follow/Unfollow System

Manage user following relationships with proper validation and social context.

```typescript
// src/modules/social/api/follow-user.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userFollows, users } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';
import { nanoid } from '@/lib/nanoid';

import { type } from 'arktype';

const FollowUserInput = type({
  userId: 'string > 0',
});

export const followUser = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = FollowUserInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ userId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    if (userId === session.user.id) {
      throw new Error('You cannot follow yourself');
    }

    // Verify target user exists
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, username: true },
    });

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Check if already following
    const existingFollow = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, session.user.id),
        eq(userFollows.followingId, userId),
      ),
    });

    if (existingFollow) {
      throw new Error('Already following this user');
    }

    // Create follow relationship
    await db.transaction(async (tx) => {
      // Insert follow record
      await tx.insert(userFollows).values({
        id: nanoid(),
        followerId: session.user.id,
        followingId: userId,
      });

      // Update denormalized counts
      await tx
        .update(users)
        .set({
          followingCount: sql`${users.followingCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      await tx
        .update(users)
        .set({
          followerCount: sql`${users.followerCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    });

    return { success: true, user: targetUser };
  });

const UnfollowUserInput = type({
  userId: 'string > 0',
});

export const unfollowUser = createServerFn({ method: 'DELETE' })
  .validator((data: unknown) => {
    const result = UnfollowUserInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ userId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Find existing follow relationship
    const existingFollow = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, session.user.id),
        eq(userFollows.followingId, userId),
      ),
    });

    if (!existingFollow) {
      throw new Error('You are not following this user');
    }

    // Remove follow relationship
    await db.transaction(async (tx) => {
      // Delete follow record
      await tx.delete(userFollows).where(eq(userFollows.id, existingFollow.id));

      // Update denormalized counts
      await tx
        .update(users)
        .set({
          followingCount: sql`GREATEST(0, ${users.followingCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      await tx
        .update(users)
        .set({
          followerCount: sql`GREATEST(0, ${users.followerCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    });

    return { success: true };
  });
```

### 2. Get User's Social Network

Retrieve followers and following lists with pagination and metadata.

```typescript
// src/modules/social/api/get-user-network.ts
import { createServerFn } from '@tanstack/react-start';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userFollows, users } from '@/lib/db/schemas';

const GetUserFollowersInput = type({
  userId: 'string > 0',
  'limit?': 'number <= 100',
  'offset?': 'number >= 0',
});

export const getUserFollowers = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetUserFollowersInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return {
      ...result,
      limit: Math.min(result.limit || 20, 100),
      offset: result.offset || 0,
    };
  })
  .handler(async ({ userId, limit, offset }) => {
    const followers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        bio: users.bio,
        followedAt: userFollows.createdAt,
        followerCount: users.followerCount,
        followingCount: users.followingCount,
        postsCount: users.postsCount,
      })
      .from(userFollows)
      .innerJoin(users, eq(users.id, userFollows.followerId))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit)
      .offset(offset);

    return followers;
  });

const GetUserFollowingInput = type({
  userId: 'string > 0',
  'limit?': 'number <= 100',
  'offset?': 'number >= 0',
});

export const getUserFollowing = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetUserFollowingInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return {
      ...result,
      limit: Math.min(result.limit || 20, 100),
      offset: result.offset || 0,
    };
  })
  .handler(async ({ userId, limit, offset }) => {
    const following = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        bio: users.bio,
        followedAt: userFollows.createdAt,
        followerCount: users.followerCount,
        followingCount: users.followingCount,
        postsCount: users.postsCount,
      })
      .from(userFollows)
      .innerJoin(users, eq(users.id, userFollows.followingId))
      .where(eq(userFollows.followerId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit)
      .offset(offset);

    return following;
  });

const GetFollowStatusInput = type({
  userId: 'string > 0',
  targetUserId: 'string > 0',
});

export const getFollowStatus = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetFollowStatusInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ userId, targetUserId }) => {
    const follow = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, userId),
        eq(userFollows.followingId, targetUserId),
      ),
    });

    return {
      isFollowing: !!follow,
      followedAt: follow?.createdAt || null,
    };
  });
```

### 3. Activity Feed

Generate personalized activity feeds based on followed users and interactions.

```typescript
// src/modules/social/api/get-activity-feed.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, inArray, desc, and, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, users, userFollows } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

export const getActivityFeed = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      limit?: number;
      offset?: number;
      timeframe?: '24h' | '7d' | '30d' | 'all';
    }) => ({
      ...data,
      limit: Math.min(data.limit || 20, 100),
      offset: data.offset || 0,
      timeframe: data.timeframe || '7d',
    }),
  )
  .handler(async ({ limit, offset, timeframe }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Get users that the current user follows
    const followingUsers = await db
      .select({ userId: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, session.user.id));

    const followingUserIds = followingUsers.map((f) => f.userId);
    // Include own posts in feed
    followingUserIds.push(session.user.id);

    if (followingUserIds.length === 0) {
      return [];
    }

    // Calculate time filter
    let timeFilter;
    const now = new Date();
    switch (timeframe) {
      case '24h':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = null;
    }

    const whereConditions = [
      inArray(posts.authorId, followingUserIds),
      eq(posts.status, 'published'),
    ];

    if (timeFilter) {
      whereConditions.push(gte(posts.publishedAt, timeFilter));
    }

    const feedPosts = await db.query.posts.findMany({
      where: and(...whereConditions),
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
      },
      orderBy: desc(posts.publishedAt),
      limit,
      offset,
    });

    return feedPosts;
  });

export const getTrendingPosts = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      limit?: number;
      offset?: number;
      timeframe?: '24h' | '7d' | '30d';
    }) => ({
      ...data,
      limit: Math.min(data.limit || 20, 100),
      offset: data.offset || 0,
      timeframe: data.timeframe || '7d',
    }),
  )
  .handler(async ({ limit, offset, timeframe }) => {
    // Calculate trending score based on engagement and recency
    const timeframeHours = {
      '24h': 24,
      '7d': 168,
      '30d': 720,
    }[timeframe];

    const trendingPosts = await db.execute(sql`
      SELECT 
        p.*,
        u.username,
        u.name as author_name,
        u.avatar as author_avatar,
        o.name as organization_name,
        o.slug as organization_slug,
        (
          (p.view_count * 0.1) +
          (p.like_count * 1.0) +
          (p.comment_count * 2.0) +
          (p.share_count * 3.0) +
          -- Time decay factor
          (EXTRACT(EPOCH FROM (NOW() - p.published_at)) / 3600.0 / ${timeframeHours} * -10.0)
        ) as trending_score
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN organizations o ON p.organization_id = o.id
      WHERE 
        p.status = 'published' 
        AND p.published_at > NOW() - INTERVAL '${timeframeHours} hours'
      ORDER BY trending_score DESC, p.published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    return trendingPosts;
  });
```

### 4. User Discovery and Recommendations

Suggest users to follow based on network connections and interests.

```typescript
// src/modules/social/api/user-recommendations.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and, not, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, userFollows, posts, postCategories } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

export const getRecommendedUsers = createServerFn({ method: 'GET' })
  .validator(
    (data: {
      limit?: number;
      algorithm?: 'network' | 'activity' | 'interests';
    }) => ({
      ...data,
      limit: Math.min(data.limit || 10, 50),
      algorithm: data.algorithm || 'network',
    }),
  )
  .handler(async ({ limit, algorithm }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    switch (algorithm) {
      case 'network':
        return getNetworkBasedRecommendations(session.user.id, limit);
      case 'activity':
        return getActivityBasedRecommendations(session.user.id, limit);
      case 'interests':
        return getInterestBasedRecommendations(session.user.id, limit);
      default:
        return getNetworkBasedRecommendations(session.user.id, limit);
    }
  });

async function getNetworkBasedRecommendations(userId: string, limit: number) {
  // Find users followed by people you follow
  const recommendations = await db.execute(sql`
    WITH user_following AS (
      SELECT following_id 
      FROM user_follows 
      WHERE follower_id = ${userId}
    ),
    second_degree_follows AS (
      SELECT 
        uf.following_id,
        COUNT(*) as mutual_connections,
        array_agg(u.name) as mutual_friends
      FROM user_follows uf
      JOIN users u ON u.id = uf.follower_id
      WHERE uf.follower_id IN (SELECT following_id FROM user_following)
        AND uf.following_id != ${userId}
        AND uf.following_id NOT IN (SELECT following_id FROM user_following)
      GROUP BY uf.following_id
      ORDER BY mutual_connections DESC
      LIMIT ${limit}
    )
    SELECT 
      u.id,
      u.username,
      u.name,
      u.avatar,
      u.bio,
      u.follower_count,
      u.posts_count,
      sdf.mutual_connections,
      sdf.mutual_friends
    FROM second_degree_follows sdf
    JOIN users u ON u.id = sdf.following_id
    ORDER BY sdf.mutual_connections DESC, u.follower_count DESC
  `);

  return recommendations;
}

async function getActivityBasedRecommendations(userId: string, limit: number) {
  // Find active users in similar topics/organizations
  const recommendations = await db.execute(sql`
    WITH user_activity AS (
      SELECT 
        p.author_id,
        COUNT(*) as recent_posts,
        AVG(p.view_count + p.like_count + p.comment_count) as avg_engagement
      FROM posts p
      WHERE p.status = 'published' 
        AND p.published_at > NOW() - INTERVAL '30 days'
        AND p.author_id != ${userId}
        AND p.author_id NOT IN (
          SELECT following_id FROM user_follows WHERE follower_id = ${userId}
        )
      GROUP BY p.author_id
      HAVING COUNT(*) >= 2
      ORDER BY recent_posts DESC, avg_engagement DESC
      LIMIT ${limit}
    )
    SELECT 
      u.id,
      u.username,
      u.name,
      u.avatar,
      u.bio,
      u.follower_count,
      u.posts_count,
      ua.recent_posts,
      ROUND(ua.avg_engagement) as avg_engagement
    FROM user_activity ua
    JOIN users u ON u.id = ua.author_id
    ORDER BY ua.recent_posts DESC, ua.avg_engagement DESC
  `);

  return recommendations;
}

async function getInterestBasedRecommendations(userId: string, limit: number) {
  // Find users who write about similar topics/categories
  const recommendations = await db.execute(sql`
    WITH user_categories AS (
      SELECT pc.category_id, COUNT(*) as post_count
      FROM posts p
      JOIN post_categories pc ON pc.post_id = p.id
      WHERE p.author_id = ${userId} AND p.status = 'published'
      GROUP BY pc.category_id
      ORDER BY post_count DESC
      LIMIT 5
    ),
    similar_authors AS (
      SELECT 
        p.author_id,
        COUNT(DISTINCT pc.category_id) as shared_categories,
        COUNT(*) as posts_in_categories,
        AVG(p.view_count + p.like_count) as avg_engagement
      FROM posts p
      JOIN post_categories pc ON pc.post_id = p.id
      WHERE pc.category_id IN (SELECT category_id FROM user_categories)
        AND p.author_id != ${userId}
        AND p.status = 'published'
        AND p.author_id NOT IN (
          SELECT following_id FROM user_follows WHERE follower_id = ${userId}
        )
      GROUP BY p.author_id
      HAVING COUNT(DISTINCT pc.category_id) >= 2
      ORDER BY shared_categories DESC, avg_engagement DESC
      LIMIT ${limit}
    )
    SELECT 
      u.id,
      u.username,
      u.name,
      u.avatar,
      u.bio,
      u.follower_count,
      u.posts_count,
      sa.shared_categories,
      sa.posts_in_categories,
      ROUND(sa.avg_engagement) as avg_engagement
    FROM similar_authors sa
    JOIN users u ON u.id = sa.author_id
    ORDER BY sa.shared_categories DESC, sa.avg_engagement DESC
  `);

  return recommendations;
}
```

### 5. Social Stats and Analytics

Track social metrics and provide insights for users and content.

```typescript
// src/modules/social/api/social-analytics.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, gte, count, sum } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, userFollows, users, postViews } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

const GetUserSocialStatsInput = type({
  'userId?': 'string',
  'period?': "'7d' | '30d' | '90d'",
});

export const getUserSocialStats = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetUserSocialStatsInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return {
      ...result,
      period: result.period || '30d',
    };
  })
  .handler(async ({ userId, period }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    // Use provided userId or current user's ID
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      throw new Error('User ID required');
    }

    // Calculate time range
    const periodDays = { '7d': 7, '30d': 30, '90d': 90 }[period];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get follower growth
    const followerGrowth = await db
      .select({ count: count() })
      .from(userFollows)
      .where(
        and(
          eq(userFollows.followingId, targetUserId),
          gte(userFollows.createdAt, startDate),
        ),
      );

    // Get content performance
    const contentStats = await db
      .select({
        totalPosts: count(),
        totalViews: sum(posts.viewCount),
        totalLikes: sum(posts.likeCount),
        totalComments: sum(posts.commentCount),
        totalShares: sum(posts.shareCount),
      })
      .from(posts)
      .where(
        and(
          eq(posts.authorId, targetUserId),
          eq(posts.status, 'published'),
          gte(posts.publishedAt, startDate),
        ),
      );

    // Get top performing posts
    const topPosts = await db.query.posts.findMany({
      where: and(
        eq(posts.authorId, targetUserId),
        eq(posts.status, 'published'),
        gte(posts.publishedAt, startDate),
      ),
      orderBy: desc(
        sql`${posts.viewCount} + ${posts.likeCount} + ${posts.commentCount}`,
      ),
      limit: 5,
      columns: {
        id: true,
        title: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        publishedAt: true,
      },
    });

    return {
      period,
      followerGrowth: followerGrowth[0]?.count || 0,
      contentStats: contentStats[0] || {
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
      },
      topPosts,
      calculatedAt: new Date(),
    };
  });

export const getNetworkInsights = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Get mutual connections analysis
    const mutualConnections = await db.execute(sql`
      WITH my_following AS (
        SELECT following_id FROM user_follows WHERE follower_id = ${session.user.id}
      ),
      mutual_analysis AS (
        SELECT 
          uf.following_id as common_follow,
          u.name,
          u.username,
          COUNT(*) as mutual_count
        FROM user_follows uf
        JOIN users u ON u.id = uf.following_id
        WHERE uf.follower_id IN (SELECT following_id FROM my_following)
          AND uf.following_id NOT IN (SELECT following_id FROM my_following)
          AND uf.following_id != ${session.user.id}
        GROUP BY uf.following_id, u.name, u.username
        HAVING COUNT(*) >= 2
        ORDER BY mutual_count DESC
        LIMIT 10
      )
      SELECT * FROM mutual_analysis
    `);

    // Get network growth trends
    const networkGrowth = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as new_followers
      FROM user_follows
      WHERE following_id = ${session.user.id}
        AND created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week DESC
    `);

    return {
      mutualConnections,
      networkGrowth,
      calculatedAt: new Date(),
    };
  },
);
```

## React Query Integration

### Query Options and Hooks

```typescript
// src/modules/social/hooks/use-social-queries.ts
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  getUserFollowers,
  getUserFollowing,
  getFollowStatus,
  getActivityFeed,
  getTrendingPosts,
  getRecommendedUsers,
  getUserSocialStats,
} from '@/modules/social/api';

export const socialQueries = {
  all: () => ['social'] as const,

  // Following relationships
  followers: (userId: string) =>
    queryOptions({
      queryKey: [...socialQueries.all(), 'followers', userId] as const,
      queryFn: ({ pageParam = 0 }) =>
        getUserFollowers({ userId, offset: pageParam * 20 }),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),

  following: (userId: string) =>
    queryOptions({
      queryKey: [...socialQueries.all(), 'following', userId] as const,
      queryFn: ({ pageParam = 0 }) =>
        getUserFollowing({ userId, offset: pageParam * 20 }),
      staleTime: 2 * 60 * 1000,
    }),

  followStatus: (userId: string, targetUserId: string) =>
    queryOptions({
      queryKey: [
        ...socialQueries.all(),
        'follow-status',
        userId,
        targetUserId,
      ] as const,
      queryFn: () => getFollowStatus({ userId, targetUserId }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  // Activity feeds
  activityFeed: (timeframe: '24h' | '7d' | '30d' | 'all' = '7d') =>
    queryOptions({
      queryKey: [...socialQueries.all(), 'feed', timeframe] as const,
      queryFn: ({ pageParam = 0 }) =>
        getActivityFeed({ timeframe, offset: pageParam * 20 }),
      staleTime: 1 * 60 * 1000, // 1 minute
    }),

  trending: (timeframe: '24h' | '7d' | '30d' = '7d') =>
    queryOptions({
      queryKey: [...socialQueries.all(), 'trending', timeframe] as const,
      queryFn: ({ pageParam = 0 }) =>
        getTrendingPosts({ timeframe, offset: pageParam * 20 }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  // Recommendations
  recommendations: (
    algorithm: 'network' | 'activity' | 'interests' = 'network',
  ) =>
    queryOptions({
      queryKey: [...socialQueries.all(), 'recommendations', algorithm] as const,
      queryFn: () => getRecommendedUsers({ algorithm }),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }),

  // Analytics
  userStats: (userId?: string, period: '7d' | '30d' | '90d' = '30d') =>
    queryOptions({
      queryKey: [...socialQueries.all(), 'stats', userId, period] as const,
      queryFn: () => getUserSocialStats({ userId, period }),
      staleTime: 5 * 60 * 1000,
    }),
};

// Custom hooks with object parameters
export function useUserFollowers({ userId }: { userId: string }) {
  return useInfiniteQuery({
    ...socialQueries.followers(userId),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 20 ? pages.length : undefined,
  });
}

export function useUserFollowing({ userId }: { userId: string }) {
  return useInfiniteQuery({
    ...socialQueries.following(userId),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 20 ? pages.length : undefined,
  });
}

export function useFollowStatus({
  userId,
  targetUserId,
}: {
  userId: string;
  targetUserId: string;
}) {
  return useQuery(socialQueries.followStatus(userId, targetUserId));
}

export function useActivityFeed({
  timeframe = '7d',
}: {
  timeframe?: '24h' | '7d' | '30d' | 'all';
} = {}) {
  return useInfiniteQuery({
    ...socialQueries.activityFeed(timeframe),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 20 ? pages.length : undefined,
  });
}

export function useTrendingPosts({
  timeframe = '7d',
}: {
  timeframe?: '24h' | '7d' | '30d';
} = {}) {
  return useQuery(socialQueries.trending(timeframe));
}

export function useRecommendedUsers({
  algorithm = 'network',
}: {
  algorithm?: 'network' | 'activity' | 'interests';
} = {}) {
  return useQuery(socialQueries.recommendations(algorithm));
}

export function useUserSocialStats({
  userId,
  period = '30d',
}: {
  userId?: string;
  period?: '7d' | '30d' | '90d';
} = {}) {
  return useQuery(socialQueries.userStats(userId, period));
}
```

### Mutation Hooks

```typescript
// src/modules/social/hooks/use-social-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser } from '@/modules/social/api';
import { socialQueries } from './use-social-queries';
import { userProfileQueries } from '@/modules/users/hooks/use-profile-queries';

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onMutate: async ({ userId }) => {
      // Optimistically update follow status
      const statusQueryKey = socialQueries.followStatus(
        queryClient.getQueryData(['auth', 'current-session'])?.user?.id || '',
        userId,
      ).queryKey;

      await queryClient.cancelQueries({ queryKey: statusQueryKey });

      const previousStatus = queryClient.getQueryData(statusQueryKey);

      queryClient.setQueryData(statusQueryKey, {
        isFollowing: true,
        followedAt: new Date(),
      });

      return { previousStatus };
    },
    onSuccess: () => {
      // Invalidate all social queries
      queryClient.invalidateQueries({
        queryKey: socialQueries.all(),
      });

      // Invalidate user profile queries to update follower counts
      queryClient.invalidateQueries({
        queryKey: userProfileQueries.all(),
      });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousStatus) {
        const statusQueryKey = socialQueries.followStatus(
          queryClient.getQueryData(['auth', 'current-session'])?.user?.id || '',
          variables.userId,
        ).queryKey;

        queryClient.setQueryData(statusQueryKey, context.previousStatus);
      }
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onMutate: async ({ userId }) => {
      // Optimistically update follow status
      const statusQueryKey = socialQueries.followStatus(
        queryClient.getQueryData(['auth', 'current-session'])?.user?.id || '',
        userId,
      ).queryKey;

      await queryClient.cancelQueries({ queryKey: statusQueryKey });

      const previousStatus = queryClient.getQueryData(statusQueryKey);

      queryClient.setQueryData(statusQueryKey, {
        isFollowing: false,
        followedAt: null,
      });

      return { previousStatus };
    },
    onSuccess: () => {
      // Invalidate all social queries
      queryClient.invalidateQueries({
        queryKey: socialQueries.all(),
      });

      // Invalidate user profile queries
      queryClient.invalidateQueries({
        queryKey: userProfileQueries.all(),
      });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousStatus) {
        const statusQueryKey = socialQueries.followStatus(
          queryClient.getQueryData(['auth', 'current-session'])?.user?.id || '',
          variables.userId,
        ).queryKey;

        queryClient.setQueryData(statusQueryKey, context.previousStatus);
      }
    },
  });
}
```

## Frontend Component Patterns

### Follow Button Component

```typescript
// src/components/social/follow-button.tsx
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useFollowStatus } from '@/modules/social/hooks/use-social-queries';
import { useFollowUser, useUnfollowUser } from '@/modules/social/hooks/use-social-mutations';
import { useRouter } from '@tanstack/react-router';

type FollowButtonProps = {
  userId: string;
  currentUserId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
};

export function FollowButton({
  userId,
  currentUserId,
  className,
  size = 'default',
  variant = 'default',
}: FollowButtonProps) {
  const router = useRouter();
  const { data: followStatus, isLoading } = useFollowStatus({
    userId: currentUserId,
    targetUserId: userId,
  });
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Don't show follow button for own profile
  if (userId === currentUserId) {
    return null;
  }

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      router.navigate({ to: '/auth/signin' });
      return;
    }

    try {
      if (followStatus?.isFollowing) {
        await unfollowUser.mutateAsync({ userId });
      } else {
        await followUser.mutateAsync({ userId });
      }
    } catch (error) {
      // Error handling is done by React Query
      console.error('Follow/unfollow error:', error);
    }
  };

  const isFollowing = followStatus?.isFollowing || false;
  const isPending = followUser.isPending || unfollowUser.isPending;

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading || isPending}
      size={size}
      variant={isFollowing ? 'outline' : variant}
      className={className}
    >
      {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {isFollowing ? (
        <>
          <Icons.userCheck className="mr-2 h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <Icons.userPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
```

### Activity Feed Component

```typescript
// src/components/social/activity-feed.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useActivityFeed } from '@/modules/social/hooks/use-social-queries';
import { formatDistanceToNow } from 'date-fns';

type ActivityFeedProps = {
  timeframe?: '24h' | '7d' | '30d' | 'all';
  className?: string;
};

export function ActivityFeed({
  timeframe = '7d',
  className,
}: ActivityFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useActivityFeed({ timeframe });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Icons.alertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Failed to load activity feed</p>
        </CardContent>
      </Card>
    );
  }

  const posts = data?.pages.flatMap((page) => page) || [];

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Icons.rss className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            No recent activity from people you follow
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Follow more users to see their latest posts here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {post.author.avatar && (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{post.author.name}</span>
                      <span className="text-muted-foreground">
                        @{post.author.username}
                      </span>
                    </div>
                    {post.organization && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Icons.building className="h-3 w-3" />
                        <span>{post.organization.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.publishedAt!))} ago
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-muted-foreground mb-3 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Icons.eye className="h-4 w-4 mr-1" />
                    {post.viewCount || 0}
                  </div>
                  <div className="flex items-center">
                    <Icons.heart className="h-4 w-4 mr-1" />
                    {post.likeCount || 0}
                  </div>
                  <div className="flex items-center">
                    <Icons.messageCircle className="h-4 w-4 mr-1" />
                    {post.commentCount || 0}
                  </div>
                  <Badge variant="secondary">
                    {post.readingTime} min read
                  </Badge>
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <a href={`/posts/${post.slug}`}>Read more</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasNextPage && (
        <div className="text-center mt-8">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Load more posts
          </Button>
        </div>
      )}
    </div>
  );
}
```

### User Recommendations Component

```typescript
// src/components/social/user-recommendations.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useRecommendedUsers } from '@/modules/social/hooks/use-social-queries';
import { FollowButton } from './follow-button';

type UserRecommendationsProps = {
  currentUserId: string;
  algorithm?: 'network' | 'activity' | 'interests';
  className?: string;
};

export function UserRecommendations({
  currentUserId,
  algorithm = 'network',
  className,
}: UserRecommendationsProps) {
  const { data: users, isLoading, error } = useRecommendedUsers({ algorithm });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Suggested for you</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !users?.length) {
    return null;
  }

  const getRecommendationReason = (user: any) => {
    if (algorithm === 'network' && user.mutualConnections) {
      return `${user.mutualConnections} mutual connections`;
    }
    if (algorithm === 'activity' && user.recentPosts) {
      return `${user.recentPosts} recent posts`;
    }
    if (algorithm === 'interests' && user.sharedCategories) {
      return `${user.sharedCategories} shared interests`;
    }
    return 'Suggested for you';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icons.users className="h-5 w-5 mr-2" />
          Who to follow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between space-x-3"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{user.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getRecommendationReason(user)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {user.followerCount} followers
                    </span>
                  </div>
                </div>
              </div>
              <FollowButton
                userId={user.id}
                currentUserId={currentUserId}
                size="sm"
                variant="outline"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Performance Optimization

1. **Denormalized Counts** - Follower/following counts stored on user records for fast access
2. **Infinite Queries** - Paginated feeds and lists for large datasets
3. **Optimistic Updates** - Immediate UI feedback for follow/unfollow actions
4. **Smart Caching** - Different stale times based on data volatility
5. **Database Indexes** - All foreign keys and query patterns are indexed

## Security Considerations

1. **Privacy Controls** - User visibility and follow permissions
2. **Rate Limiting** - Prevent follow/unfollow spam
3. **Data Validation** - All inputs validated on server-side
4. **SQL Injection Prevention** - Parameterized queries via Drizzle ORM
5. **Authentication** - All social operations require valid sessions

## Integration Points

- **Authentication**: Uses better-auth for session management
- **Database**: Built on existing user_follows and users tables
- **Content System**: Integrates with posts for activity feeds
- **Organizations**: Supports organization-aware social features
- **Analytics**: Tracks social metrics and user engagement

This implementation guide provides a comprehensive social features system with following, discovery, activity feeds, and community interaction patterns, all built on the existing architectural foundation.
