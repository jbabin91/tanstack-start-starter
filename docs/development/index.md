# Development Guide

This guide covers development patterns, best practices, and implementation standards for the TanStack Start blogging platform.

## Quick Links

- **[Quick Start Guide](../overview/quickstart.md)** - Get your environment set up
- **[Architecture Overview](../architecture/index.md)** - Understand the system design
- **[API Reference](../api/index.md)** - Server function documentation

## Development Patterns

### Module Structure

Each feature follows a consistent pattern:

```text
src/modules/{feature}/
├── api/              # Server functions (one per file)
│   ├── get-{resource}.ts
│   ├── create-{resource}.ts
│   └── update-{resource}.ts
├── hooks/            # React Query integration
│   ├── use-queries.ts
│   └── use-mutations.ts (when needed)
├── components/       # Feature-specific components
├── types/           # TypeScript types
└── utils/           # Feature utilities
```

### Server Functions (TanStack Start v1.87+)

Each server function follows this pattern:

```typescript
// Example: src/modules/posts/api/get-post.ts
export const getPost = createServerFn({ method: 'GET' })
  .validator(/* validation schema */)
  .handler(async (data) => {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    // Permission validation
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // Business logic
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, data.id),
      with: { author: true, organization: true },
    });

    return post;
  });
```

### Query Patterns

TanStack Query integration follows this structure:

```typescript
// src/modules/posts/hooks/use-queries.ts
export const postQueries = {
  all: () =>
    queryOptions({
      queryKey: ['posts'] as const,
      queryFn: () => getAllPosts(),
    }),

  byId: (id: string) =>
    queryOptions({
      queryKey: ['posts', id] as const,
      queryFn: () => getPost({ data: id }),
    }),
};

// Custom hooks with object parameters (REQUIRED pattern)
export function usePost({ id }: { id: string }) {
  return useSuspenseQuery(postQueries.byId(id));
}

export function usePostWithLoading({
  id,
  enabled = true,
}: {
  id?: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...postQueries.byId(id ?? ''),
    enabled: enabled && !!id,
  });
}
```

### Database Patterns

Modern Drizzle schema patterns:

```typescript
// Always use array syntax for constraints
export const posts = pgTable(
  'posts',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: varchar({ length: 255 }).notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Always add indexes for foreign keys and common queries
    index('posts_user_id_idx').on(table.userId),
    index('posts_created_at_idx').on(table.createdAt),
  ],
);
```

### Component Patterns

React component standards:

```typescript
// Use function declarations for components
function PostCard({ post, onEdit }: PostCardProps) {
  const { user } = Route.useRouteContext();

  // Object parameters for custom hooks
  const { mutate: deletePost } = useDeletePost();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Use Icons component for all icons */}
        <Icons.user className="h-4 w-4" />
        <p>{post.content}</p>
      </CardContent>
    </Card>
  );
}

// Always export type with component
interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
}
```

### UI Component Patterns

#### Using ShadCN/UI Components

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn'; // Note: NOT @/lib/utils

function MyComponent({ className }: { className?: string }) {
  return (
    <Card className={cn('p-4', className)}>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

#### Using the Icons Component

```typescript
import { Icons } from '@/components/icons';

// DO: Use centralized Icons component
<Icons.settings className="h-4 w-4" />
<Icons.user className="h-5 w-5 text-muted-foreground" />

// DON'T: Import directly from lucide-react
// ❌ import { Settings } from 'lucide-react';
```

### Form Patterns with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

function CreatePostForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await createPost(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('title')}
        aria-invalid={errors.title ? 'true' : 'false'}
      />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea {...register('content')} />
      {errors.content && <span>{errors.content.message}</span>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Icons.spinner className="animate-spin" /> : 'Submit'}
      </Button>
    </form>
  );
}
```

### Table Patterns with TanStack Table

```typescript
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

const columns = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equals',
  },
];

function PostsTable({ data }: { data: Post[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Virtualization with TanStack Virtual

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualPostList({ posts }: { posts: Post[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated item height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        className="relative"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            className="absolute left-0 top-0 w-full"
            style={{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <PostCard post={posts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Validation with Arktype

```typescript
import { type } from 'arktype';

// Define validators
const CreatePostInput = type({
  title: 'string > 0',
  content: 'string >= 10',
  status: "'draft' | 'published'",
  'tags?': 'string[]',
});

// Use in server functions
export const createPost = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const result = CreatePostInput(data);
    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }
    return result;
  })
  .handler(async (validatedData) => {
    // validatedData is fully typed
    return await db.insert(posts).values(validatedData).returning();
  });

// Extract type for client use
type CreatePostInput = typeof CreatePostInput.infer;
```

## Code Quality Standards

### Automatic Enforcement

All code quality is enforced automatically:

```bash
# These run automatically on file changes
pnpm format      # Prettier formatting
pnpm lint        # ESLint validation
pnpm typecheck   # TypeScript checking
```

**Zero-tolerance policy**: All linting errors must be resolved immediately.

### Import Standards

```typescript
// MANDATORY: Always use @/ alias for src imports
import { Button } from '@/components/ui/button';
import { usePost } from '@/modules/posts/hooks/use-queries';
import { Posts } from '@/lib/db/schemas';

// Never use relative imports like ../../../
// ❌ import { Button } from '../../../components/ui/button';
```

### TypeScript Standards

```typescript
// Prefer type over interface
type User = {
  id: string;
  email: string;
  name: string;
};

// Use type imports
import type { User } from '@/modules/users/types';

// Object parameters for all custom hooks
export function useUser({ id }: { id: string }) {
  return useSuspenseQuery(userQueries.byId(id));
}
```

## Performance Best Practices

### Database Optimization

```typescript
// Always include proper indexes
export const posts = pgTable(
  'posts',
  {
    // ... fields
  },
  (table) => [
    // Index all foreign keys
    index('posts_user_id_idx').on(table.userId),
    // Index frequently queried fields
    index('posts_status_idx').on(table.status),
    // Composite indexes for common query patterns
    index('posts_user_created_idx').on(table.userId, table.createdAt),
  ],
);

// Use relational queries for complex data
const postsWithAuthors = await db.query.posts.findMany({
  with: {
    author: true,
    organization: true,
  },
  orderBy: desc(posts.createdAt),
});
```

### Query Optimization

```typescript
// Use proper query key patterns for cache management
export const postQueries = {
  // Base queries
  all: () =>
    queryOptions({
      queryKey: ['posts'] as const,
      queryFn: () => getAllPosts(),
    }),

  // Parameterized queries
  byUser: (userId: string) =>
    queryOptions({
      queryKey: ['posts', 'user', userId] as const,
      queryFn: () => getUserPosts({ userId }),
    }),

  // Specific resource queries
  byId: (id: string) =>
    queryOptions({
      queryKey: ['posts', id] as const,
      queryFn: () => getPost({ data: id }),
    }),
};

// Cache invalidation patterns
queryClient.invalidateQueries({
  queryKey: postQueries.byUser(userId).queryKey,
});
```

## Error Handling

### Server Function Error Patterns

```typescript
export const createPost = createServerFn({ method: 'POST' }).handler(
  async (data) => {
    try {
      const { headers } = getWebRequest();
      const session = await auth.api.getSession({ headers });

      // Authentication check
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      // Permission check
      if (
        data.organizationId &&
        !session.user.permissions?.includes('posts:create')
      ) {
        throw new Error('Insufficient permissions');
      }

      // Business logic
      const post = await db
        .insert(posts)
        .values({
          ...data,
          authorId: session.user.id,
        })
        .returning();

      return { success: true, post: post[0] };
    } catch (error) {
      console.error('Create post error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create post',
      );
    }
  },
);
```

### Client Error Boundaries

```typescript
// Use error boundaries for component error handling
function PostList() {
  return (
    <ErrorBoundary fallback={<PostListError />}>
      <PostListContent />
    </ErrorBoundary>
  );
}

// Handle query errors gracefully
function PostListContent() {
  const { data: posts, error } = usePosts();

  if (error) {
    return <div>Failed to load posts: {error.message}</div>;
  }

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

## Testing Patterns

### Server Function Testing

```typescript
// Test server functions with proper mocking
describe('createPost', () => {
  it('should create post for authenticated user', async () => {
    // Mock authentication
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user1', permissions: ['posts:create'] },
    });

    // Mock database
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'post1', title: 'Test' }]),
      }),
    });

    const result = await createPost({
      title: 'Test Post',
      content: 'Test content',
    });

    expect(result.success).toBe(true);
    expect(result.post.title).toBe('Test Post');
  });
});
```

### Component Testing

```typescript
// Test components with proper providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={createTestRouter()}>
        {ui}
      </RouterProvider>
    </QueryClientProvider>
  );
}

describe('PostCard', () => {
  it('should display post title and content', () => {
    const mockPost = { id: '1', title: 'Test', content: 'Content' };

    renderWithProviders(<PostCard post={mockPost} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
```

## Deployment Preparation

### Build Optimization

```bash
# Ensure clean build
pnpm build

# Type checking
pnpm typecheck

# Final linting
pnpm lint

# Test suite
pnpm test
```

### Environment Variables

```bash
# Required for production
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
RESEND_API_KEY=...

# Optional features
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Strategic Context

This development guide implements the patterns designed in our strategic planning documents:

- **[Content Creation System](./../.serena/memories/content_creation_writing_interface_design.md)** - Editor and publishing workflows
- **[Search & Discovery System](./../.serena/memories/search_discovery_system_design.md)** - Search optimization and user experience
- **[Implementation Roadmaps](./../.serena/memories/implementation_roadmap_content_creation.md)** - Phase-by-phase development planning

For architectural decisions and system design rationale, see:

- **[Architecture Overview](../architecture/index.md)** - System architecture and technical design
- **[Database Design](../architecture/database.md)** - Schema and performance optimization
