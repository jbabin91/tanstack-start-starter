# Technical Specifications - Content Creation & Writing Interface

## Overview

Technical implementation specifications for the GitHub-style markdown editor with organization workflows, co-authoring, draft management, and publishing system.

## Database Schema

### Posts & Drafts Schema

#### Posts Table Enhancement

```sql
-- Extend existing posts table
ALTER TABLE posts
ADD COLUMN publishing_type VARCHAR(20) DEFAULT 'personal'
  CHECK (publishing_type IN ('personal', 'organization_member', 'organization_official')),
ADD COLUMN organization_id TEXT REFERENCES organizations(id),
ADD COLUMN review_status VARCHAR(20) DEFAULT 'published'
  CHECK (review_status IN ('draft', 'shared', 'submitted', 'under_review', 'approved', 'rejected', 'published')),
ADD COLUMN submitted_at TIMESTAMP,
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN approved_by TEXT REFERENCES users(id),
ADD COLUMN rejection_reason TEXT,
ADD COLUMN reading_time INTEGER, -- in minutes
ADD COLUMN word_count INTEGER,
ADD COLUMN tags TEXT[], -- Array of tags
ADD COLUMN category VARCHAR(100),
ADD COLUMN template_id TEXT REFERENCES organization_templates(id),
ADD COLUMN canonical_url TEXT,
ADD COLUMN social_image_url TEXT,
ADD COLUMN auto_save_content JSONB; -- For auto-save state

-- Indexes for performance
CREATE INDEX idx_posts_organization_review ON posts(organization_id, review_status);
CREATE INDEX idx_posts_publishing_type ON posts(publishing_type);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_category ON posts(category);
```

#### Co-authors System

```sql
CREATE TABLE post_co_authors (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('editor', 'viewer', 'reviewer')),
  added_by TEXT NOT NULL REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),

  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_co_authors_post ON post_co_authors(post_id);
CREATE INDEX idx_post_co_authors_user ON post_co_authors(user_id);
```

#### Draft Comments System

```sql
CREATE TABLE draft_comments (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  line_number INTEGER, -- For inline comments
  parent_id TEXT REFERENCES draft_comments(id), -- For replies
  resolved BOOLEAN DEFAULT false,
  resolved_by TEXT REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_draft_comments_post ON draft_comments(post_id);
CREATE INDEX idx_draft_comments_author ON draft_comments(author_id);
CREATE INDEX idx_draft_comments_parent ON draft_comments(parent_id);
```

#### Organization Templates

```sql
CREATE TABLE organization_templates (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- Markdown template
  category VARCHAR(50) DEFAULT 'blog-post',
  is_default BOOLEAN DEFAULT false,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_org_templates_organization ON organization_templates(organization_id);
CREATE INDEX idx_org_templates_category ON organization_templates(category);

-- Ensure only one default template per category per org
CREATE UNIQUE INDEX idx_org_templates_default_unique
ON organization_templates(organization_id, category)
WHERE is_default = true;
```

#### Organization Writing Guidelines

```sql
CREATE TABLE organization_guidelines (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  guidelines JSONB NOT NULL, -- Flexible guidelines structure
  enforcement_level VARCHAR(20) DEFAULT 'suggestion' CHECK (enforcement_level IN ('suggestion', 'required')),
  review_checklist TEXT[], -- Array of checklist items
  created_by TEXT NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(organization_id)
);
```

#### Auto-save & Version Management

```sql
CREATE TABLE post_auto_saves (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  title VARCHAR(500),
  metadata JSONB, -- Editor state, cursor position, etc.
  saved_at TIMESTAMP DEFAULT NOW(),

  -- Keep only recent auto-saves
  CONSTRAINT recent_auto_saves CHECK (saved_at > NOW() - INTERVAL '7 days')
);

CREATE INDEX idx_post_auto_saves_post_user ON post_auto_saves(post_id, user_id, saved_at DESC);

-- Clean up old auto-saves
CREATE OR REPLACE FUNCTION cleanup_old_auto_saves()
RETURNS void AS $$
BEGIN
  DELETE FROM post_auto_saves
  WHERE saved_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron or external scheduler)
-- SELECT cron.schedule('cleanup-auto-saves', '0 2 * * *', 'SELECT cleanup_old_auto_saves();');
```

## Component Architecture

### Core Writing Components

#### MarkdownEditor Component

```typescript
// File: src/components/editor/markdown-editor.tsx

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onAutoSave?: (content: string, metadata: EditorMetadata) => void;
  placeholder?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
}

interface EditorMetadata {
  cursorPosition: number;
  scrollPosition: number;
  selectedText?: string;
  wordCount: number;
  readingTime: number;
}

export function MarkdownEditor({
  value,
  onChange,
  onAutoSave,
  placeholder = "Start writing...",
  readOnly = false,
  showToolbar = true,
  enableAutoSave = true,
  autoSaveInterval = 10000
}: MarkdownEditorProps) {
  const [metadata, setMetadata] = useState<EditorMetadata>();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save with debouncing
  const debouncedAutoSave = useCallback(
    debounce((content: string, meta: EditorMetadata) => {
      onAutoSave?.(content, meta);
    }, autoSaveInterval),
    [onAutoSave, autoSaveInterval]
  );

  // Handle editor changes
  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);

    const meta: EditorMetadata = {
      cursorPosition: editorRef.current?.selectionStart || 0,
      scrollPosition: editorRef.current?.scrollTop || 0,
      wordCount: countWords(newValue),
      readingTime: calculateReadingTime(newValue)
    };

    setMetadata(meta);

    if (enableAutoSave) {
      debouncedAutoSave(newValue, meta);
    }
  }, [onChange, debouncedAutoSave, enableAutoSave]);

  return (
    <div className="markdown-editor">
      {showToolbar && <EditorToolbar onInsert={handleInsert} />}

      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full min-h-[400px] p-4 font-mono resize-none border-0 focus:outline-none"
        spellCheck
      />

      <EditorStatusBar metadata={metadata} />
    </div>
  );
}
```

#### PreviewPane Component

```typescript
// File: src/components/editor/preview-pane.tsx

interface PreviewPaneProps {
  content: string;
  className?: string;
  showComments?: boolean;
  comments?: DraftComment[];
  onAddComment?: (lineNumber: number, content: string) => void;
}

export function PreviewPane({
  content,
  className,
  showComments = false,
  comments = [],
  onAddComment
}: PreviewPaneProps) {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    // Process markdown with syntax highlighting
    const processed = markdownProcessor.process(content);
    setProcessedContent(processed);
  }, [content]);

  return (
    <div className={`preview-pane prose max-w-none ${className}`}>
      <div
        dangerouslySetInnerHTML={{ __html: processedContent }}
        className="markdown-content"
      />

      {showComments && (
        <CommentsOverlay
          comments={comments}
          onAddComment={onAddComment}
        />
      )}
    </div>
  );
}
```

### Writing Interface Layout

#### WriteLayout Component

```typescript
// File: src/components/layouts/write-layout.tsx

type EditorMode = 'write' | 'preview' | 'split';

interface WriteLayoutProps {
  post: Post | null;
  onSave: (post: Partial<Post>) => void;
  onPublish: (post: Partial<Post>) => void;
  onAutoSave: (content: string, metadata: EditorMetadata) => void;
}

export function WriteLayout({ post, onSave, onPublish, onAutoSave }: WriteLayoutProps) {
  const [mode, setMode] = useState<EditorMode>('write');
  const [content, setContent] = useState(post?.content || '');
  const [title, setTitle] = useState(post?.title || '');
  const [publishingContext, setPublishingContext] = useState<PublishingContext>();

  return (
    <div className="write-layout min-h-screen">
      {/* Header */}
      <WriteHeader
        mode={mode}
        onModeChange={setMode}
        onSave={() => onSave({ title, content })}
        onPublish={() => onPublish({ title, content, ...publishingContext })}
      />

      {/* Publishing Context */}
      <PublishingContextBar
        context={publishingContext}
        onChange={setPublishingContext}
      />

      {/* Editor Area */}
      <div className="flex-1 flex">
        {(mode === 'write' || mode === 'split') && (
          <div className={mode === 'split' ? 'w-1/2' : 'w-full'}>
            <TitleEditor
              value={title}
              onChange={setTitle}
              placeholder="Post title..."
            />
            <MarkdownEditor
              value={content}
              onChange={setContent}
              onAutoSave={onAutoSave}
            />
          </div>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div className={mode === 'split' ? 'w-1/2 border-l' : 'w-full'}>
            <PreviewPane content={`# ${title}\n\n${content}`} />
          </div>
        )}
      </div>
    </div>
  );
}
```

### Publishing Context Management

#### PublishingContextBar Component

```typescript
// File: src/components/editor/publishing-context-bar.tsx

interface PublishingContext {
  type: 'personal' | 'organization';
  organizationId?: string;
  publishingMode?: 'member' | 'official';
  coAuthors: CoAuthor[];
  visibility: 'public' | 'private' | 'organization' | 'unlisted';
  tags: string[];
  category?: string;
  scheduledAt?: Date;
}

export function PublishingContextBar({
  context,
  onChange
}: {
  context: PublishingContext;
  onChange: (context: PublishingContext) => void;
}) {
  const { user } = Route.useRouteContext();

  return (
    <div className="publishing-context border-b bg-muted/50 p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Context Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Publishing as:</span>
          <Select
            value={context.organizationId || 'personal'}
            onValueChange={handleContextChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">
                <div className="flex items-center gap-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  Personal
                </div>
              </SelectItem>
              {user?.organizations?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={org.avatar} />
                      <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {org.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organization Publishing Mode */}
        {context.organizationId && (
          <div className="flex items-center gap-2">
            <RadioGroup
              value={context.publishingMode}
              onValueChange={(value: 'member' | 'official') =>
                onChange({ ...context, publishingMode: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member" className="text-sm">
                  Post as member (moderated)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="official" id="official" />
                <Label htmlFor="official" className="text-sm">
                  Official post (requires approval)
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Co-authors */}
        <CoAuthorManager
          coAuthors={context.coAuthors}
          onChange={(coAuthors) => onChange({ ...context, coAuthors })}
        />

        {/* Review Warning */}
        {context.organizationId && context.publishingMode === 'official' && (
          <Alert className="w-full mt-2">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              This post will require approval from {user?.activeOrganization?.name} admins before publishing.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
```

## API Specifications

### Draft Management Endpoints

#### Auto-save Endpoint

```typescript
// File: src/modules/posts/api/auto-save-draft.ts

export const autoSaveDraft = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      postId: z.string(),
      content: z.string(),
      title: z.string().optional(),
      metadata: z
        .object({
          cursorPosition: z.number(),
          scrollPosition: z.number(),
          wordCount: z.number(),
          readingTime: z.number(),
        })
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error('Not authenticated');

    // Verify user can edit this post
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, data.postId))
      .limit(1);

    if (!post.length) throw new Error('Post not found');

    const canEdit =
      post[0].authorId === session.user.id ||
      (await userCanEditPost(session.user.id, data.postId));

    if (!canEdit) throw new Error('Permission denied');

    // Update auto-save
    await db
      .insert(postAutoSaves)
      .values({
        postId: data.postId,
        userId: session.user.id,
        content: data.content,
        title: data.title,
        metadata: data.metadata,
      })
      .onConflictDoUpdate({
        target: [postAutoSaves.postId, postAutoSaves.userId],
        set: {
          content: data.content,
          title: data.title,
          metadata: data.metadata,
          savedAt: new Date(),
        },
      });

    return { success: true, savedAt: new Date() };
  });
```

#### Co-author Management

```typescript
// File: src/modules/posts/api/manage-co-authors.ts

export const addCoAuthor = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      postId: z.string(),
      userId: z.string(),
      role: z.enum(['editor', 'viewer', 'reviewer']),
    }),
  )
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error('Not authenticated');

    // Verify user can manage this post
    const canManage = await userCanManagePost(session.user.id, data.postId);
    if (!canManage) throw new Error('Permission denied');

    // Add co-author
    await db.insert(postCoAuthors).values({
      postId: data.postId,
      userId: data.userId,
      role: data.role,
      addedBy: session.user.id,
    });

    // Send notification to co-author
    await sendCoAuthorInvitation({
      postId: data.postId,
      inviteeId: data.userId,
      inviterId: session.user.id,
      role: data.role,
    });

    return { success: true };
  });

export const acceptCoAuthorInvitation = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      postId: z.string(),
      accept: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error('Not authenticated');

    await db
      .update(postCoAuthors)
      .set({
        status: data.accept ? 'accepted' : 'declined',
        acceptedAt: data.accept ? new Date() : null,
      })
      .where(
        and(
          eq(postCoAuthors.postId, data.postId),
          eq(postCoAuthors.userId, session.user.id),
        ),
      );

    return { success: true };
  });
```

### Publishing & Review Workflow

#### Submit for Review

```typescript
// File: src/modules/posts/api/submit-for-review.ts

export const submitForReview = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      postId: z.string(),
      organizationId: z.string(),
      publishingType: z.enum(['organization_member', 'organization_official']),
      message: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error('Not authenticated');

    // Verify organization membership
    const membership = await getUserMembership({
      userId: session.user.id,
      organizationId: data.organizationId,
    });

    if (!membership.length) {
      throw new Error('Not a member of this organization');
    }

    // Update post status
    await db
      .update(posts)
      .set({
        organizationId: data.organizationId,
        publishingType: data.publishingType,
        reviewStatus:
          data.publishingType === 'organization_official'
            ? 'submitted'
            : 'approved',
        submittedAt: new Date(),
      })
      .where(eq(posts.id, data.postId));

    // Notify organization admins if official post
    if (data.publishingType === 'organization_official') {
      await notifyOrganizationAdmins({
        organizationId: data.organizationId,
        postId: data.postId,
        authorId: session.user.id,
        message: data.message,
      });
    }

    return { success: true };
  });
```

#### Review Post (Admin)

```typescript
// File: src/modules/posts/api/review-post.ts

export const reviewPost = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      postId: z.string(),
      action: z.enum(['approve', 'reject', 'request_changes']),
      message: z.string().optional(),
      changes_requested: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    if (!session) throw new Error('Not authenticated');

    // Get post and verify reviewer permissions
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, data.postId))
      .limit(1);

    if (!post.length) throw new Error('Post not found');

    const canReview = await userCanReviewOrganizationPost(
      session.user.id,
      post[0].organizationId!,
    );

    if (!canReview) throw new Error('Permission denied');

    const updateData: Partial<Post> = {
      approvedBy: session.user.id,
      updatedAt: new Date(),
    };

    switch (data.action) {
      case 'approve':
        updateData.reviewStatus = 'approved';
        updateData.approvedAt = new Date();
        break;

      case 'reject':
        updateData.reviewStatus = 'rejected';
        updateData.rejectionReason = data.message;
        break;

      case 'request_changes':
        updateData.reviewStatus = 'draft';
        // Add comment with requested changes
        break;
    }

    await db.update(posts).set(updateData).where(eq(posts.id, data.postId));

    // Notify author
    await notifyPostAuthor({
      postId: data.postId,
      action: data.action,
      reviewerId: session.user.id,
      message: data.message,
    });

    return { success: true };
  });
```

## React Query Integration

### Draft Queries

```typescript
// File: src/modules/posts/hooks/use-draft-queries.ts

export const draftQueries = {
  all: (userId: string) =>
    queryOptions({
      queryKey: ['drafts', userId] as const,
      queryFn: () => getUserDrafts({ userId }),
      staleTime: 1000 * 60 * 2, // 2 minutes
    }),

  byId: (draftId: string) =>
    queryOptions({
      queryKey: ['drafts', draftId] as const,
      queryFn: () => getDraft({ draftId }),
      staleTime: 1000 * 30, // 30 seconds
    }),

  coAuthors: (postId: string) =>
    queryOptions({
      queryKey: ['drafts', postId, 'co-authors'] as const,
      queryFn: () => getPostCoAuthors({ postId }),
    }),

  comments: (postId: string) =>
    queryOptions({
      queryKey: ['drafts', postId, 'comments'] as const,
      queryFn: () => getDraftComments({ postId }),
      staleTime: 1000 * 30, // 30 seconds
    }),
};

export function useDraft({ draftId }: { draftId: string }) {
  return useSuspenseQuery(draftQueries.byId(draftId));
}

export function useAutoSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: autoSaveDraft,
    onSuccess: (_, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        draftQueries.byId(variables.postId).queryKey,
        (old: Post) =>
          old
            ? {
                ...old,
                content: variables.content,
                title: variables.title,
                updatedAt: new Date(),
              }
            : old,
      );
    },
    // Don't show errors for auto-save failures
    onError: (error) => {
      console.warn('Auto-save failed:', error);
    },
  });
}
```

## Real-time Collaboration

### WebSocket Integration

```typescript
// File: src/lib/collaboration/websocket-client.ts

interface CollaborationEvent {
  type:
    | 'cursor_move'
    | 'content_change'
    | 'user_join'
    | 'user_leave'
    | 'comment_add';
  postId: string;
  userId: string;
  data: any;
  timestamp: number;
}

export class CollaborationClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private postId: string,
    private userId: string,
    private onEvent: (event: CollaborationEvent) => void,
  ) {}

  connect() {
    const wsUrl = `${process.env.WS_URL}/collaborate/${this.postId}?userId=${this.userId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Collaboration connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data: CollaborationEvent = JSON.parse(event.data);
      this.onEvent(data);
    };

    this.ws.onclose = () => {
      this.handleReconnect();
    };
  }

  sendEvent(event: Omit<CollaborationEvent, 'userId' | 'timestamp'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          ...event,
          userId: this.userId,
          timestamp: Date.now(),
        }),
      );
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(
        () => {
          this.reconnectAttempts++;
          this.connect();
        },
        1000 * Math.pow(2, this.reconnectAttempts),
      );
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
```

## Performance Optimizations

### Bundle Splitting

```typescript
// Lazy load editor components
const MarkdownEditor = lazy(
  () => import('./components/editor/markdown-editor'),
);
const PreviewPane = lazy(() => import('./components/editor/preview-pane'));

// Split editor into separate chunks
const EditorBundle = lazy(() => import('./editor-bundle'));
```

### Memory Management

```typescript
// Efficient markdown processing
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

// Cached processor instance
const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHighlight)
  .use(rehypeStringify);

// Memoized processing
export const processMarkdown = useMemo(() => {
  return (content: string) => markdownProcessor.processSync(content).toString();
}, []);
```

This technical specification provides the complete implementation foundation for the content creation system, supporting the GitHub-style editor with comprehensive organization workflows and collaboration features.
