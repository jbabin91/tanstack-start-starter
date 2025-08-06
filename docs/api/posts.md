# Posts API

This document covers all content creation server functions for posts, drafts, publishing workflows, and co-authoring.

## Overview

The posts system provides:

- **Draft management** - Auto-save and manual draft operations
- **Publishing workflows** - Personal and organization publishing with review
- **Co-authoring** - Collaborative writing with multiple authors
- **Content versioning** - Track changes and revisions

## Draft Management Functions

### Create Draft

```typescript
export const createDraft = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      title: t.string().optional(),
      content: t.string().optional(),
      organizationId: t.string().optional(),
    }),
  )
  .handler(async ({ title, content, organizationId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const draft = await db
      .insert(drafts)
      .values({
        authorId: session.user.id,
        title: title || 'Untitled Draft',
        content: content || '',
        organizationId,
        isAutoSave: false,
      })
      .returning();

    return draft[0];
  });
```

### Auto-save Draft

```typescript
export const autoSaveDraft = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      draftId: t.string().optional(),
      title: t.string(),
      content: t.string(),
      organizationId: t.string().optional(),
    }),
  )
  .handler(async ({ draftId, title, content, organizationId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    if (draftId) {
      // Update existing draft
      const updatedDraft = await db
        .update(drafts)
        .set({
          title,
          content,
          updatedAt: new Date(),
        })
        .where(
          and(eq(drafts.id, draftId), eq(drafts.authorId, session.user.id)),
        )
        .returning();

      if (updatedDraft.length === 0) {
        throw new Error('Draft not found or access denied');
      }

      return updatedDraft[0];
    } else {
      // Create new auto-save draft
      const newDraft = await db
        .insert(drafts)
        .values({
          authorId: session.user.id,
          title,
          content,
          organizationId,
          isAutoSave: true,
        })
        .returning();

      return newDraft[0];
    }
  });
```

### Get User Drafts

```typescript
export const getUserDrafts = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      organizationId: t.string().optional(),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
    }),
  )
  .handler(async ({ organizationId, limit, offset }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const drafts = await db.query.drafts.findMany({
      where: and(
        eq(drafts.authorId, session.user.id),
        organizationId ? eq(drafts.organizationId, organizationId) : undefined,
      ),
      with: {
        organization: {
          columns: { id: true, name: true, slug: true },
        },
      },
      orderBy: desc(drafts.updatedAt),
      limit,
      offset,
    });

    return drafts;
  });
```

## Post Publishing Functions

### Create Post from Draft

```typescript
export const createPostFromDraft = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      draftId: t.string(),
      publishingType: t
        .enum(['personal', 'organization_member', 'organization_official'])
        .default('personal'),
      tags: t.array(t.string()).optional(),
      excerpt: t.string().optional(),
      featuredImage: t.string().optional(),
      publishImmediately: t.boolean().default(false),
    }),
  )
  .handler(
    async ({
      draftId,
      publishingType,
      tags,
      excerpt,
      featuredImage,
      publishImmediately,
    }) => {
      const { headers } = getWebRequest();
      const session = await auth.api.getSession({ headers });

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const draft = await db.query.drafts.findFirst({
        where: and(
          eq(drafts.id, draftId),
          eq(drafts.authorId, session.user.id),
        ),
      });

      if (!draft) {
        throw new Error('Draft not found');
      }

      // Verify organization publishing permissions
      if (publishingType.startsWith('organization') && draft.organizationId) {
        const membership = await db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.userId, session.user.id),
            eq(organizationMembers.organizationId, draft.organizationId),
          ),
        });

        if (!membership) {
          throw new Error('Not a member of this organization');
        }

        if (
          publishingType === 'organization_official' &&
          !['admin', 'owner'].includes(membership.role)
        ) {
          // Submit for review instead
          publishImmediately = false;
        }
      }

      const slug = generateSlug(draft.title);
      const wordCount = countWords(draft.content);
      const readingTime = Math.ceil(wordCount / 250);

      const post = await db
        .insert(posts)
        .values({
          title: draft.title,
          slug,
          content: draft.content,
          excerpt: excerpt || extractExcerpt(draft.content),
          authorId: session.user.id,
          organizationId: draft.organizationId,
          publishingType,
          featuredImage,
          wordCount,
          readingTime,
          status: publishImmediately ? 'published' : 'pending_review',
          publishedAt: publishImmediately ? new Date() : null,
          submittedAt: !publishImmediately ? new Date() : null,
        })
        .returning();

      // Add tags if provided
      if (tags?.length) {
        await db.insert(postTags).values(
          tags.map((tag) => ({
            postId: post[0].id,
            tag: tag.toLowerCase(),
          })),
        );
      }

      // Clean up draft
      await db.delete(drafts).where(eq(drafts.id, draftId));

      return {
        post: post[0],
        status: publishImmediately ? 'published' : 'submitted_for_review',
      };
    },
  );
```

### Get Posts

```typescript
export const getPosts = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      organizationId: t.string().optional(),
      authorId: t.string().optional(),
      status: t
        .enum(['published', 'draft', 'pending_review', 'archived'])
        .optional(),
      tags: t.array(t.string()).optional(),
      limit: t.number().default(20).max(100),
      offset: t.number().default(0),
    }),
  )
  .handler(
    async ({
      organizationId,
      authorId,
      status = 'published',
      tags,
      limit,
      offset,
    }) => {
      let whereConditions = [eq(posts.status, status)];

      if (organizationId) {
        whereConditions.push(eq(posts.organizationId, organizationId));
      }

      if (authorId) {
        whereConditions.push(eq(posts.authorId, authorId));
      }

      let query = db.query.posts.findMany({
        where: and(...whereConditions),
        with: {
          author: {
            columns: { id: true, name: true, username: true, avatar: true },
          },
          organization: {
            columns: { id: true, name: true, slug: true, avatar: true },
          },
          tags: {
            columns: { tag: true },
          },
          coAuthors: {
            with: {
              user: {
                columns: { id: true, name: true, username: true, avatar: true },
              },
            },
          },
        },
        orderBy: desc(posts.publishedAt),
        limit,
        offset,
      });

      // Filter by tags if provided
      if (tags?.length) {
        const taggedPosts = await db
          .select({
            postId: postTags.postId,
          })
          .from(postTags)
          .where(inArray(postTags.tag, tags))
          .groupBy(postTags.postId)
          .having(sql`COUNT(DISTINCT ${postTags.tag}) = ${tags.length}`);

        const postIds = taggedPosts.map((t) => t.postId);
        whereConditions.push(inArray(posts.id, postIds));
      }

      return await query;
    },
  );
```

### Get Single Post

```typescript
export const getPost = createServerFn({ method: 'GET' })
  .validator(
    t.object({
      slug: t.string().optional(),
      id: t.string().optional(),
      organizationSlug: t.string().optional(),
    }),
  )
  .handler(async ({ slug, id, organizationSlug }) => {
    if (!slug && !id) {
      throw new Error('Either slug or id is required');
    }

    let whereCondition;

    if (id) {
      whereCondition = eq(posts.id, id);
    } else {
      if (organizationSlug) {
        // Organization post: /org/slug/post-slug
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.slug, organizationSlug),
        });

        if (!org) {
          throw new Error('Organization not found');
        }

        whereCondition = and(
          eq(posts.slug, slug!),
          eq(posts.organizationId, org.id),
        );
      } else {
        // Personal post: /@username/post-slug
        whereCondition = and(
          eq(posts.slug, slug!),
          isNull(posts.organizationId),
        );
      }
    }

    const post = await db.query.posts.findFirst({
      where: whereCondition,
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            description: true,
          },
        },
        tags: true,
        coAuthors: {
          with: {
            user: {
              columns: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.status !== 'published') {
      // Check if user has permission to view unpublished post
      const { headers } = getWebRequest();
      const session = await auth.api.getSession({ headers });

      const canView =
        session?.user &&
        (session.user.id === post.authorId ||
          post.coAuthors.some((ca) => ca.userId === session.user.id) ||
          (post.organizationId &&
            (await hasOrganizationPermission(
              session.user.id,
              post.organizationId,
              'posts:view:all',
            ))));

      if (!canView) {
        throw new Error('Post not found');
      }
    }

    // Track view if published
    if (post.status === 'published') {
      await trackPostView(post.id, session?.user?.id);
    }

    return post;
  });
```

## Co-authoring Functions

### Add Co-author

```typescript
export const addCoAuthor = createServerFn({ method: 'POST' })
  .validator(
    t.object({
      postId: t.string(),
      userId: t.string(),
      role: t.enum(['editor', 'viewer', 'reviewer']).default('editor'),
    }),
  )
  .handler(async ({ postId, userId, role }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if user can add co-authors
    const canManage =
      session.user.id === post.authorId ||
      (await hasPostPermission(session.user.id, postId, 'manage_coauthors'));

    if (!canManage) {
      throw new Error('Permission denied');
    }

    // Check if user is already a co-author
    const existingCoAuthor = await db.query.postCoAuthors.findFirst({
      where: and(
        eq(postCoAuthors.postId, postId),
        eq(postCoAuthors.userId, userId),
      ),
    });

    if (existingCoAuthor) {
      throw new Error('User is already a co-author');
    }

    const coAuthor = await db
      .insert(postCoAuthors)
      .values({
        postId,
        userId,
        role,
        invitedBy: session.user.id,
      })
      .returning();

    // Send notification to invited user
    await sendCoAuthorInvitation(userId, postId, session.user.id);

    return coAuthor[0];
  });
```

### Accept Co-author Invitation

```typescript
export const acceptCoAuthorInvitation = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      coAuthorId: t.string(),
    }),
  )
  .handler(async ({ coAuthorId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const coAuthor = await db.query.postCoAuthors.findFirst({
      where: and(
        eq(postCoAuthors.id, coAuthorId),
        eq(postCoAuthors.userId, session.user.id),
        isNull(postCoAuthors.acceptedAt),
      ),
    });

    if (!coAuthor) {
      throw new Error('Invitation not found');
    }

    const updatedCoAuthor = await db
      .update(postCoAuthors)
      .set({ acceptedAt: new Date() })
      .where(eq(postCoAuthors.id, coAuthorId))
      .returning();

    return updatedCoAuthor[0];
  });
```

## Publishing Workflow Functions

### Submit for Review

```typescript
export const submitForReview = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      postId: t.string(),
      message: t.string().optional(),
    }),
  )
  .handler(async ({ postId, message }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Check permission
    if (post.authorId !== session.user.id) {
      throw new Error('Permission denied');
    }

    if (post.status !== 'draft') {
      throw new Error('Post is not in draft status');
    }

    await db
      .update(posts)
      .set({
        status: 'pending_review',
        submittedAt: new Date(),
        lastReviewedAt: null,
      })
      .where(eq(posts.id, postId));

    // Notify organization reviewers
    if (post.organizationId) {
      await notifyReviewers(post.organizationId, postId, message);
    }

    return { success: true };
  });
```

### Review Post

```typescript
export const reviewPost = createServerFn({ method: 'PUT' })
  .validator(
    t.object({
      postId: t.string(),
      action: t.enum(['approve', 'reject', 'request_changes']),
      feedback: t.string().optional(),
    }),
  )
  .handler(async ({ postId, action, feedback }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: { organization: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Check reviewer permissions
    if (!post.organizationId) {
      throw new Error('This post is not part of an organization');
    }

    const hasReviewPermission = await hasOrganizationPermission(
      session.user.id,
      post.organizationId,
      'posts:review',
    );

    if (!hasReviewPermission) {
      throw new Error('Permission denied');
    }

    let newStatus: string;
    let publishedAt: Date | null = null;

    switch (action) {
      case 'approve':
        newStatus = 'published';
        publishedAt = new Date();
        break;
      case 'reject':
        newStatus = 'draft';
        break;
      case 'request_changes':
        newStatus = 'draft';
        break;
    }

    await db
      .update(posts)
      .set({
        status: newStatus,
        publishedAt,
        lastReviewedAt: new Date(),
        reviewedBy: session.user.id,
      })
      .where(eq(posts.id, postId));

    // Add review comment if feedback provided
    if (feedback) {
      await addReviewComment(postId, session.user.id, feedback, action);
    }

    // Notify author
    await notifyAuthor(post.authorId, postId, action, feedback);

    return { success: true, status: newStatus };
  });
```

## React Query Integration

### Posts Queries

```typescript
// src/modules/posts/hooks/use-queries.ts
export const postQueries = {
  list: (filters: GetPostsFilters = {}) =>
    queryOptions({
      queryKey: ['posts', 'list', filters] as const,
      queryFn: () => getPosts(filters),
    }),

  bySlug: (slug: string, organizationSlug?: string) =>
    queryOptions({
      queryKey: ['posts', 'slug', slug, organizationSlug] as const,
      queryFn: () => getPost({ slug, organizationSlug }),
    }),

  byId: (id: string) =>
    queryOptions({
      queryKey: ['posts', 'id', id] as const,
      queryFn: () => getPost({ id }),
    }),

  drafts: (organizationId?: string) =>
    queryOptions({
      queryKey: ['posts', 'drafts', organizationId] as const,
      queryFn: () => getUserDrafts({ organizationId }),
    }),
};

// Custom hooks
export function usePosts(filters?: GetPostsFilters) {
  return useQuery(postQueries.list(filters));
}

export function usePost({
  slug,
  id,
  organizationSlug,
}: {
  slug?: string;
  id?: string;
  organizationSlug?: string;
}) {
  return useQuery(
    slug ? postQueries.bySlug(slug, organizationSlug) : postQueries.byId(id!),
  );
}

export function useDrafts({
  organizationId,
}: { organizationId?: string } = {}) {
  return useQuery(postQueries.drafts(organizationId));
}
```

### Post Mutations

```typescript
export function useCreateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts', 'drafts'],
      });
    },
  });
}

export function useAutoSave() {
  return useMutation({
    mutationFn: autoSaveDraft,
    // Don't show loading states for auto-save
    meta: { hideLoading: true },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPostFromDraft,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['posts', 'drafts'],
      });

      if (result.status === 'published') {
        queryClient.invalidateQueries({
          queryKey: ['posts', 'list'],
        });
      }
    },
  });
}

export function useAddCoAuthor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCoAuthor,
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ['posts', 'id', postId],
      });
    },
  });
}
```

## Strategic Context

This posts API implements the content creation system designed in:

- **[Content Creation System](../../.serena/memories/content_creation_writing_interface_design.md)** - GitHub-style editor, co-authoring, and publishing workflows
- **[Implementation Roadmap](../../.serena/memories/implementation_roadmap_content_creation.md)** - Phase-by-phase development planning

For related documentation, see:

- **[Authentication API](./auth.md)** - User sessions and permissions
- **[Organizations API](./organizations.md)** - Organization management and member roles
- **[Development Guide](../development/index.md)** - Implementation patterns and standards
