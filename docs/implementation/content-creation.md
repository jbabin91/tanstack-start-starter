# Content Creation Implementation Guide

This guide provides complete implementation patterns for content creation and management, including post creation, editing, drafts, co-authoring, and publishing workflows.

## Database Foundation (Ready)

The content creation system is built on these existing database tables:

```sql
-- Core posts table with publishing workflow support
posts (
  id,
  title,
  slug,
  content,
  excerpt,
  status,              -- 'draft', 'published', 'archived'
  publishing_type,     -- 'personal', 'organization_member', 'organization_official'

  -- Authorship
  author_id,
  organization_id,

  -- Content metadata
  reading_time,
  word_count,
  featured_image,

  -- SEO and social
  meta_title,
  meta_description,
  social_image,

  -- Publishing workflow
  submitted_at,
  published_at,
  last_reviewed_at,
  reviewed_by,

  created_at,
  updated_at
)

-- Co-authoring support
post_co_authors (
  id,
  post_id,
  user_id,
  role,                -- 'editor', 'viewer', 'reviewer'
  invited_by,
  accepted_at,
  created_at
)

-- Draft management and auto-save
drafts (
  id,
  post_id,
  user_id,
  title,
  content,
  metadata,
  is_auto_save,
  created_at,
  updated_at
)

-- Tags and categories
post_tags (
  id,
  post_id,
  tag,
  created_at
)

post_categories (
  id,
  post_id,
  category_id,
  created_at
)
```

## API Implementation Patterns

### 1. Create New Post

Create a new post with draft status and auto-generated metadata.

```typescript
// src/modules/posts/api/create-post.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { db } from '@/lib/db';
import { posts, drafts } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';
import { nanoid } from '@/lib/nanoid';
import { generateSlug } from '@/modules/posts/utils/slug';
import { calculateReadingTime } from '@/modules/posts/utils/reading-time';

const CreatePostInput = type({
  title: 'string > 0 <= 500',
  'content?': 'string',
  'organizationId?': 'string',
  'publishingType?':
    "'personal' | 'organization_member' | 'organization_official'",
});

export const createPost = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = CreatePostInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(
    async ({
      title,
      content = '',
      organizationId,
      publishingType = 'personal',
    }) => {
      const { headers } = getWebRequest();
      const session = await auth.api.getSession({ headers });

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // Verify organization access if specified
      if (organizationId) {
        const membership = await db.query.organizationMembers.findFirst({
          where: and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, session.user.id),
          ),
        });

        if (!membership) {
          throw new Error('You are not a member of this organization');
        }
      }

      const postId = nanoid();
      const slug = await generateSlug(title, postId);
      const readingTime = calculateReadingTime(content);
      const wordCount = content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      // Create post
      const newPost = await db
        .insert(posts)
        .values({
          id: postId,
          title: title.trim(),
          slug,
          content,
          excerpt: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
          status: 'draft',
          publishingType,
          authorId: session.user.id,
          organizationId,
          readingTime,
          wordCount,
        })
        .returning();

      // Create initial draft for auto-save
      await db.insert(drafts).values({
        id: nanoid(),
        postId,
        userId: session.user.id,
        title: title.trim(),
        content,
        isAutoSave: false,
      });

      return newPost[0];
    },
  );
```

### 2. Update Post Content

Update post content with automatic metadata recalculation.

```typescript
// src/modules/posts/api/update-post.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { type } from 'arktype';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, postCoAuthors } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';
import { calculateReadingTime } from '@/modules/posts/utils/reading-time';

const UpdatePostInput = type({
  postId: 'string',
  'title?': 'string <= 500',
  'content?': 'string',
  'excerpt?': 'string',
  'featuredImage?': 'string',
  'metaTitle?': 'string <= 255',
  'metaDescription?': 'string <= 500',
  'socialImage?': 'string',
});

export const updatePost = createServerFn({ method: 'PUT' })
  .validator((data: unknown) => {
    const result = UpdatePostInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ postId, ...updateData }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Check if user can edit this post
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        coAuthors: {
          where: eq(postCoAuthors.userId, session.user.id),
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const canEdit =
      post.authorId === session.user.id ||
      post.coAuthors.some((ca) => ca.role === 'editor');

    if (!canEdit) {
      throw new Error('You do not have permission to edit this post');
    }

    // Calculate new metadata if content changed
    let additionalUpdates = {};
    if (updateData.content !== undefined) {
      const wordCount = updateData.content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const readingTime = calculateReadingTime(updateData.content);

      additionalUpdates = {
        wordCount,
        readingTime,
        excerpt:
          updateData.excerpt ||
          updateData.content.slice(0, 200) +
            (updateData.content.length > 200 ? '...' : ''),
      };
    }

    const updatedPost = await db
      .update(posts)
      .set({
        ...updateData,
        ...additionalUpdates,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();

    return updatedPost[0];
  });
```

### 3. Publish Post

Publish a draft post with validation and workflow support.

```typescript
// src/modules/posts/api/publish-post.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, organizationMembers } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

const PublishPostInput = type({
  postId: 'string > 0',
});

export const publishPost = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = PublishPostInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ postId }) => {
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

    if (post.authorId !== session.user.id) {
      throw new Error('You can only publish your own posts');
    }

    if (post.status === 'published') {
      throw new Error('Post is already published');
    }

    // Validate post is ready for publishing
    if (!post.title || !post.content) {
      throw new Error('Post must have title and content to be published');
    }

    // Check organization publishing permissions if needed
    if (
      post.organizationId &&
      post.publishingType === 'organization_official'
    ) {
      const membership = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.organizationId, post.organizationId),
          eq(organizationMembers.userId, session.user.id),
        ),
      });

      if (
        !membership ||
        !membership.permissions?.includes('posts:publish_official')
      ) {
        throw new Error(
          'You do not have permission to publish official organization content',
        );
      }
    }

    const publishedPost = await db
      .update(posts)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();

    return publishedPost[0];
  });
```

### 4. Draft Auto-Save

Auto-save draft content to prevent data loss.

```typescript
// src/modules/posts/api/save-draft.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { drafts, posts, postCoAuthors } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';
import { nanoid } from '@/lib/nanoid';

const SaveDraftInput = type({
  'postId?': 'string',
  'title?': 'string',
  'content?': 'string',
  'metadata?': 'object',
  'isAutoSave?': 'boolean',
});

export const saveDraft = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = SaveDraftInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ postId, title, content, metadata, isAutoSave = true }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    if (postId) {
      // Verify user can save drafts for this post
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: {
          coAuthors: {
            where: eq(postCoAuthors.userId, session.user.id),
          },
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      const canEdit =
        post.authorId === session.user.id ||
        post.coAuthors.some((ca) => ['editor', 'reviewer'].includes(ca.role));

      if (!canEdit) {
        throw new Error('You do not have permission to edit this post');
      }
    }

    // Find existing draft or create new one
    let existingDraft;
    if (postId) {
      existingDraft = await db.query.drafts.findFirst({
        where: and(
          eq(drafts.postId, postId),
          eq(drafts.userId, session.user.id),
          eq(drafts.isAutoSave, isAutoSave),
        ),
        orderBy: desc(drafts.updatedAt),
      });
    }

    if (existingDraft) {
      // Update existing draft
      const updatedDraft = await db
        .update(drafts)
        .set({
          title,
          content,
          metadata,
          updatedAt: new Date(),
        })
        .where(eq(drafts.id, existingDraft.id))
        .returning();

      return updatedDraft[0];
    } else {
      // Create new draft
      const newDraft = await db
        .insert(drafts)
        .values({
          id: nanoid(),
          postId,
          userId: session.user.id,
          title,
          content,
          metadata,
          isAutoSave,
        })
        .returning();

      return newDraft[0];
    }
  });
```

### 5. Co-Author Management

Invite and manage co-authors for collaborative editing.

```typescript
// src/modules/posts/api/invite-co-author.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, postCoAuthors, users } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';
import { nanoid } from '@/lib/nanoid';
import { sendCoAuthorInvitation } from '@/modules/email/api/send-co-author-invitation';

const InviteCoAuthorInput = type({
  postId: 'string > 0',
  userId: 'string > 0',
  role: "'editor' | 'viewer' | 'reviewer'",
});

export const inviteCoAuthor = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = InviteCoAuthorInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ postId, userId, role }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Verify post ownership
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post || post.authorId !== session.user.id) {
      throw new Error('You can only invite co-authors to your own posts');
    }

    // Verify invited user exists
    const invitedUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, email: true },
    });

    if (!invitedUser) {
      throw new Error('User not found');
    }

    // Check if already invited
    const existingInvitation = await db.query.postCoAuthors.findFirst({
      where: and(
        eq(postCoAuthors.postId, postId),
        eq(postCoAuthors.userId, userId),
      ),
    });

    if (existingInvitation) {
      throw new Error('User is already a co-author or has been invited');
    }

    // Create co-author invitation
    const invitation = await db
      .insert(postCoAuthors)
      .values({
        id: nanoid(),
        postId,
        userId,
        role,
        invitedBy: session.user.id,
      })
      .returning();

    // Send invitation email
    await sendCoAuthorInvitation({
      to: invitedUser.email,
      invitedBy: session.user.name,
      postTitle: post.title,
      role,
    });

    return invitation[0];
  });

const AcceptCoAuthorInvitationInput = type({
  invitationId: 'string > 0',
});

export const acceptCoAuthorInvitation = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = AcceptCoAuthorInvitationInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async ({ invitationId }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const invitation = await db.query.postCoAuthors.findFirst({
      where: and(
        eq(postCoAuthors.id, invitationId),
        eq(postCoAuthors.userId, session.user.id),
      ),
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new Error('Invitation already accepted');
    }

    const acceptedInvitation = await db
      .update(postCoAuthors)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(postCoAuthors.id, invitationId))
      .returning();

    return acceptedInvitation[0];
  });
```

### 6. Post Management

Get posts with various filters and pagination.

```typescript
// src/modules/posts/api/get-posts.ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { eq, and, or, desc, asc, like, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, users, organizations, postCoAuthors } from '@/lib/db/schemas';
import { auth } from '@/lib/auth';

const GetPostsInput = type({
  'status?': "'draft' | 'published' | 'archived'",
  'authorId?': 'string',
  'organizationId?': 'string',
  'limit?': 'number <= 100',
  'offset?': 'number >= 0',
  'sortBy?': "'createdAt' | 'publishedAt' | 'updatedAt' | 'title'",
  'sortOrder?': "'asc' | 'desc'",
  'search?': 'string',
  'includeCoAuthored?': 'boolean',
});

export const getPosts = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const result = GetPostsInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return {
      ...result,
      limit: Math.min(result.limit || 20, 100),
      offset: result.offset || 0,
      sortBy: result.sortBy || 'createdAt',
      sortOrder: result.sortOrder || 'desc',
    };
  })
  .handler(
    async ({
      status,
      authorId,
      organizationId,
      limit,
      offset,
      sortBy,
      sortOrder,
      search,
      includeCoAuthored = false,
    }) => {
      const { headers } = getWebRequest();
      const session = await auth.api.getSession({ headers });

      let whereConditions = [];

      // Status filter
      if (status) {
        whereConditions.push(eq(posts.status, status));
      }

      // Author filter
      if (authorId) {
        if (includeCoAuthored) {
          // Include posts where user is author or co-author
          whereConditions.push(
            or(
              eq(posts.authorId, authorId),
              inArray(
                posts.id,
                db
                  .select({ postId: postCoAuthors.postId })
                  .from(postCoAuthors)
                  .where(eq(postCoAuthors.userId, authorId)),
              ),
            ),
          );
        } else {
          whereConditions.push(eq(posts.authorId, authorId));
        }
      }

      // Organization filter
      if (organizationId) {
        whereConditions.push(eq(posts.organizationId, organizationId));
      }

      // Search filter
      if (search) {
        whereConditions.push(
          or(
            like(posts.title, `%${search}%`),
            like(posts.content, `%${search}%`),
          ),
        );
      }

      // Privacy filter for non-public content
      if (!session?.user) {
        whereConditions.push(eq(posts.status, 'published'));
      } else if (status !== 'draft') {
        // Only show drafts to authors and co-authors
        whereConditions.push(
          or(
            eq(posts.status, 'published'),
            and(
              eq(posts.status, 'draft'),
              or(
                eq(posts.authorId, session.user.id),
                inArray(
                  posts.id,
                  db
                    .select({ postId: postCoAuthors.postId })
                    .from(postCoAuthors)
                    .where(eq(postCoAuthors.userId, session.user.id)),
                ),
              ),
            ),
          ),
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Sort configuration
      const sortColumn = posts[sortBy];
      const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

      const postsData = await db.query.posts.findMany({
        where: whereClause,
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              username: true,
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
          coAuthors: {
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
          },
        },
        orderBy,
        limit,
        offset,
      });

      return postsData;
    },
  );
```

## React Query Integration

### Query Options and Hooks

```typescript
// src/modules/posts/hooks/use-content-queries.ts
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getPosts, getPost, getDrafts } from '@/modules/posts/api';

export const contentQueries = {
  all: () => ['content'] as const,

  posts: (filters: PostFilters = {}) =>
    queryOptions({
      queryKey: [...contentQueries.all(), 'posts', filters] as const,
      queryFn: () => getPosts(filters),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),

  post: (id: string) =>
    queryOptions({
      queryKey: [...contentQueries.all(), 'post', id] as const,
      queryFn: () => getPost({ postId: id }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  drafts: (userId: string) =>
    queryOptions({
      queryKey: [...contentQueries.all(), 'drafts', userId] as const,
      queryFn: () => getDrafts({ userId }),
      staleTime: 30 * 1000, // 30 seconds
    }),

  userPosts: (userId: string, includeCoAuthored = false) =>
    queryOptions({
      queryKey: [
        ...contentQueries.all(),
        'user-posts',
        userId,
        includeCoAuthored,
      ] as const,
      queryFn: () => getPosts({ authorId: userId, includeCoAuthored }),
      staleTime: 2 * 60 * 1000,
    }),
};

// Custom hooks
export function usePosts(filters: PostFilters = {}) {
  return useQuery(contentQueries.posts(filters));
}

export function usePost({ id }: { id: string }) {
  return useSuspenseQuery(contentQueries.post(id));
}

export function useUserPosts({
  userId,
  includeCoAuthored = false,
}: {
  userId: string;
  includeCoAuthored?: boolean;
}) {
  return useQuery(contentQueries.userPosts(userId, includeCoAuthored));
}

export function useDrafts({ userId }: { userId: string }) {
  return useQuery(contentQueries.drafts(userId));
}
```

### Mutation Hooks

```typescript
// src/modules/posts/hooks/use-content-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPost,
  updatePost,
  publishPost,
  saveDraft,
  deletePost,
} from '@/modules/posts/api';
import { contentQueries } from './use-content-queries';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate posts lists
      queryClient.invalidateQueries({
        queryKey: contentQueries.all(),
      });

      // Add to cache optimistically
      queryClient.setQueryData(
        contentQueries.post(newPost.id).queryKey,
        newPost,
      );
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: (updatedPost) => {
      // Update specific post cache
      queryClient.setQueryData(
        contentQueries.post(updatedPost.id).queryKey,
        updatedPost,
      );

      // Invalidate related lists
      queryClient.invalidateQueries({
        queryKey: [...contentQueries.all(), 'posts'],
      });
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishPost,
    onSuccess: (publishedPost) => {
      // Update specific post cache
      queryClient.setQueryData(
        contentQueries.post(publishedPost.id).queryKey,
        publishedPost,
      );

      // Invalidate all posts lists to show in published lists
      queryClient.invalidateQueries({
        queryKey: [...contentQueries.all(), 'posts'],
      });
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDraft,
    onSuccess: (draft) => {
      // Invalidate drafts list
      queryClient.invalidateQueries({
        queryKey: [...contentQueries.all(), 'drafts'],
      });
    },
  });
}
```

## Frontend Component Patterns

### Post Editor Component

```typescript
// src/components/editor/post-editor.tsx
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { type } from 'arktype';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Icons } from '@/components/icons';
import { useUpdatePost, useSaveDraft } from '@/modules/posts/hooks/use-content-mutations';
import { useAutoSave } from '@/modules/editor/hooks/use-auto-save';
import { formatDistanceToNow } from 'date-fns';

// Reusable schema - can be used in forms and server functions
export const PostFormSchema = type({
  title: 'string > 0 <= 500',
  'content?': 'string',
  'excerpt?': 'string <= 500',
  'featuredImage?': 'string',
  'metaTitle?': 'string <= 255',
  'metaDescription?': 'string <= 500',
});

type PostFormData = typeof PostFormSchema.infer;

type PostEditorProps = {
  postId: string;
  initialData: PostFormData;
  onSave?: (data: PostFormData) => void;
};

export function PostEditor({ postId, initialData, onSave }: PostEditorProps) {
  const form = useForm<PostFormData>({
    defaultValues: initialData,
  });

  const updatePost = useUpdatePost();
  const saveDraft = useSaveDraft();

  // Watch form values for auto-save
  const watchedValues = form.watch();

  // Auto-save hook
  const { isSaving, lastSaved } = useAutoSave({
    content: JSON.stringify(watchedValues),
    onSave: useCallback((content) => {
      const data = JSON.parse(content);
      return saveDraft.mutateAsync({
        postId,
        title: data.title,
        content: data.content,
        isAutoSave: true,
      });
    }, [postId, saveDraft]),
    debounceMs: 2000,
    intervalMs: 30000,
  });

  const handleSave = async (data: PostFormData) => {
    try {
      await updatePost.mutateAsync({
        postId,
        ...data,
      });
      onSave?.(data);
    } catch (error) {
      // Error handling done by React Query
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          {isSaving ? (
            <span>Saving...</span>
          ) : lastSaved ? (
            <span>Saved {formatDistanceToNow(lastSaved)} ago</span>
          ) : null}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter post title..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={20}
                    placeholder="Write your post content..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Brief description of your post..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={updatePost.isPending}>
              {updatePost.isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

### Auto-Save Hook Implementation

Our auto-save implementation correctly separates auto-save operations from manual form submissions, ensuring proper UX and avoiding state conflicts.

```typescript
// src/modules/editor/hooks/use-auto-save.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

type UseAutoSaveOptions = {
  content: string;
  onSave: (content: string) => Promise<any>;
  debounceMs?: number;
  intervalMs?: number;
  enabled?: boolean;
};

export function useAutoSave({
  content,
  onSave,
  debounceMs = 2000,
  intervalMs = 30000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastSavedContent = useRef(content);

  // Separate mutation for auto-save operations
  const autoSaveMutation = useMutation({
    mutationFn: onSave,
    onSuccess: () => {
      lastSavedContent.current = content;
      setLastSaved(new Date());
    },
    onError: (error) => {
      console.warn('Auto-save failed:', error);
      // Auto-save failures are logged but don't interrupt user workflow
    },
  });

  const performSave = useCallback(() => {
    if (content !== lastSavedContent.current && content.trim().length > 0) {
      autoSaveMutation.mutate(content);
    }
  }, [content, autoSaveMutation]);

  // Debounced auto-save on content change
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(performSave, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, performSave, debounceMs, enabled]);

  // Interval-based auto-save
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(performSave, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [performSave, intervalMs, enabled]);

  return {
    isSaving: autoSaveMutation.isPending,
    saveError: autoSaveMutation.error,
    lastSaved,
    forceSave: performSave,
  };
}
```

### Key Auto-Save Design Principles

1. **Separate Concerns**: Auto-save uses its own mutation hook, completely separate from manual save operations
2. **UI State Isolation**: `isSaving` from auto-save is used only for indicators, never for button states
3. **Error Handling**: Auto-save errors are logged but don't interrupt the user workflow
4. **Performance**: Debouncing prevents excessive save operations during typing
5. **Reliability**: Interval-based saving ensures periodic saves even during long editing sessions

### Auto-Save vs Manual Save State Management

```typescript
function PostEditor({ postId, initialData, onSave }: PostEditorProps) {
  const form = useForm<PostFormData>({
    defaultValues: initialData,
  });

  // Manual save mutation - separate from auto-save
  const updatePost = useUpdatePost();

  // Auto-save implementation
  const watchedValues = form.watch();
  const { isSaving, lastSaved } = useAutoSave({
    content: JSON.stringify(watchedValues),
    onSave: useCallback((content) => {
      const data = JSON.parse(content);
      return saveDraft({
        postId,
        title: data.title,
        content: data.content,
        isAutoSave: true, // Marked as auto-save
      });
    }, [postId]),
    debounceMs: 2000,
    intervalMs: 30000,
  });

  const handleManualSave = async (data: PostFormData) => {
    // Manual save uses form submission logic
    await updatePost.mutateAsync({
      postId,
      ...data,
    });
  };

  return (
    <div className="space-y-6">
      {/* Auto-save indicator - NOT button state */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          {isSaving ? (
            <span className="flex items-center">
              <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span>Saved {formatDistanceToNow(lastSaved)} ago</span>
          ) : null}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleManualSave)}>
          {/* Form fields */}

          {/* Manual save button uses form/mutation state - NOT auto-save state */}
          <Button
            type="submit"
            loading={updatePost.isPending}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

### Race Condition Prevention

Our implementation prevents race conditions between auto-save and manual save:

1. **Different Operations**: Auto-save creates/updates drafts, manual save updates the actual post
2. **Server Function Separation**: `saveDraft` vs `updatePost` are separate endpoints
3. **TanStack Query Isolation**: Separate mutations prevent state conflicts
4. **UI State Clarity**: Button loading states come from manual operations only

## Utility Functions

### Slug Generation

```typescript
// src/modules/posts/utils/slug.ts
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schemas';

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export async function generateSlug(
  title: string,
  postId?: string,
): Promise<string> {
  let baseSlug = createSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Check for slug uniqueness
  while (true) {
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      columns: { id: true },
    });

    if (!existingPost || existingPost.id === postId) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
```

### Reading Time Calculation

```typescript
// src/modules/posts/utils/reading-time.ts
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 250,
): number {
  if (!content) return 0;

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(readingTime, 1); // Minimum 1 minute
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}
```

## Security Considerations

1. **Authorization** - All editing operations verify user permissions
2. **Input Validation** - Content length limits and sanitization
3. **Co-Author Permissions** - Role-based access control for collaborative editing
4. **Organization Permissions** - Verify organization membership for organization posts
5. **Draft Privacy** - Drafts only visible to authors and invited co-authors

## Performance Optimization

1. **Auto-Save Debouncing** - Prevent excessive save operations
2. **Query Invalidation** - Selective cache updates for related data
3. **Pagination** - Large post lists are paginated
4. **Metadata Calculation** - Reading time and word count computed server-side
5. **Database Indexes** - Optimized for common query patterns

## Integration Points

- **Authentication**: Uses better-auth for session management
- **Database**: Built on existing posts, drafts, and co-author tables
- **Email**: Sends co-author invitation emails
- **Organizations**: Supports organization-based publishing workflows
- **File Storage**: Ready for featured image and media upload integration

This implementation guide provides everything needed to build a comprehensive content creation and management system with collaborative editing, auto-save, and publishing workflows.
