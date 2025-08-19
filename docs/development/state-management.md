# State Management Architecture

This document outlines the comprehensive state management strategy for the TanStack Start blogging platform, emphasizing minimal global state through strategic use of existing tools.

## Architecture Overview

The platform uses a **layered state management approach** that eliminates most needs for traditional global state libraries:

```typescript
✅ Server State: TanStack Query
✅ URL State: TanStack Router Search Params
✅ Form State: React Hook Form + Arktype validation
✅ Local State: React useState/useReducer
✅ Auth State: Better-auth + Router Context

🤔 Global State: Only if absolutely needed (Zustand for theme/notifications)
```

## Core Principle: Search Params Are State

Following the [TanStack "Search Params Are State"](https://tanstack.com/blog/search-params-are-state) philosophy, most UI state should be:

- **Shareable** - Users can bookmark and share exact application states
- **Type-safe** - Validated through route definitions with Arktype
- **Server-compatible** - Works with SSR/SSG out of the box
- **SEO-friendly** - Search engines understand application state

## State Management by Layer

### 1. Server State - TanStack Query

**Purpose:** All data from APIs, databases, and external services

**Implementation:**

```typescript
// Hierarchical query patterns (TkDodo style)
export const postQueries = {
  all: () => ['posts'] as const,
  lists: () => [...postQueries.all(), 'list'] as const,
  list: (filters?: PostFilters) =>
    queryOptions({
      queryKey: [...postQueries.lists(), filters],
      queryFn: () => getAllPosts(filters),
    }),
  details: () => [...postQueries.all(), 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...postQueries.details(), id],
      queryFn: () => getPost({ data: id }),
    }),
};

// Usage with object parameters
export function usePosts(filters?: PostFilters) {
  return useSuspenseQuery(postQueries.list(filters));
}
```

**Benefits:**

- Automatic caching and invalidation
- Background refetching and optimistic updates
- Integrated loading and error states
- Server-side prefetching support

### 2. URL State - TanStack Router Search Params

**Purpose:** Shareable UI state like filters, sorting, pagination, and view preferences

**Implementation:**

```typescript
import { type } from 'arktype';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';

// Route-level search param validation with Arktype
const PostsSearchSchema = type({
  sort: "'newest' | 'oldest' | 'popular'",
  filter: "'all' | 'published' | 'draft'",
  'category?': 'string',
  page: 'number',
  view: "'list' | 'grid' | 'compact'",
});

export const Route = createFileRoute('/posts/')({
  validateSearch: (search: unknown) => {
    const result = PostsSearchSchema(search);
    if (result instanceof type.errors) {
      // Return defaults on validation error
      return {
        sort: 'newest' as const,
        filter: 'all' as const,
        page: 1,
        view: 'list' as const,
      };
    }
    return result;
  },
  // Integrate with server-side data loading
  loader: async ({ search }) => {
    return await queryClient.ensureQueryData(
      postQueries.list(search)
    );
  },
});

// Component usage with ShadCN/UI components
function PostsList() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data: posts } = useQuery(postQueries.list(search));

  const handleSortChange = (newSort: string) => {
    navigate({
      search: (prev) => ({ ...prev, sort: newSort }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select value={search.sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort posts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Button
            variant={search.view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ search: (prev) => ({ ...prev, view: 'list' }) })}
          >
            <Icons.list className="h-4 w-4" />
          </Button>
          <Button
            variant={search.view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ search: (prev) => ({ ...prev, view: 'grid' }) })}
          >
            <Icons.grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <PostGrid posts={posts} view={search.view} />
    </div>
  );
}
```

**Perfect For:**

- Content filters and sorting
- Pagination state
- Search queries and results
- Active tabs and views
- Date ranges and categories

### 3. Form State - React Hook Form + Arktype

**Purpose:** Complex form state, validation, and submission handling

**Implementation:**

```typescript
import { useForm } from 'react-hook-form';
import { type } from 'arktype';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Icons } from '@/components/icons';

// Arktype validation schema
const PostFormSchema = type({
  title: 'string > 0',
  content: 'string >= 10',
  status: "'draft' | 'published'",
  publishingType: "'personal' | 'organization_member' | 'organization_official'",
  'excerpt?': 'string',
  'tags?': 'string[]',
});

type PostFormData = typeof PostFormSchema.infer;

// Content creation forms
function PostEditor({ draftId }: { draftId?: string }) {
  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      status: 'draft',
      publishingType: 'personal',
      excerpt: '',
      tags: [],
    },
  });

  // Auto-save integration
  const watchedContent = form.watch();
  const { isSaving, lastSaved } = useAutoSave(watchedContent, draftId);

  const onSubmit = (data: PostFormData) => {
    const validationResult = PostFormSchema(data);
    if (validationResult instanceof type.errors) {
      console.error('Validation failed:', validationResult.summary);
      return;
    }

    // Submit validated data
    createPostMutation.mutate(validationResult);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create New Post
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {isSaving && (
              <>
                <Icons.spinner className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {lastSaved && !isSaving && (
              <span>Last saved: {formatDistanceToNow(lastSaved)} ago</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter post title..." />
                  </FormControl>
                  <FormDescription>
                    A compelling title for your post
                  </FormDescription>
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
                      placeholder="Write your post content..."
                      className="min-h-[400px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Write your post content in Markdown format
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center">
                            <Icons.fileText className="mr-2 h-4 w-4" />
                            Draft
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center">
                            <Icons.checkCircle className="mr-2 h-4 w-4" />
                            Published
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publishingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publishing Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select publishing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="organization_member">Organization Member</SelectItem>
                        <SelectItem value="organization_official">Organization Official</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Post'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Dynamic form fields with useFieldArray
import { useFieldArray } from 'react-hook-form';

function TagsEditor() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  });

  return (
    <FormItem>
      <FormLabel>Tags</FormLabel>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            <Input
              {...control.register(`tags.${index}.name`)}
              placeholder="Enter tag..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Icons.x className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '' })}
          className="w-full"
        >
          <Icons.plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>
    </FormItem>
  );
}
```

**Integration Patterns:**

- **With TanStack Query:** Form submissions trigger query invalidations
- **With Router:** Form success navigates to appropriate routes
- **With Auth Context:** Forms auto-populate with user/organization context
- **With Arktype:** Runtime validation with excellent TypeScript inference

### 4. Local State - React Built-ins

**Purpose:** Component-specific UI state that doesn't need to be shared

**Implementation:**

```typescript
import { useState, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';

// Modal and dropdown state
function PostActionsMenu({ post }: { post: Post }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Icons.moreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(post)}>
            <Icons.edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Icons.trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete &quot;{post.title}&quot;? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Complex local state with useReducer
type EditorState = {
  mode: 'write' | 'preview' | 'split';
  isFullscreen: boolean;
  wordCount: number;
  readingTime: number;
};

type EditorAction =
  | { type: 'SET_MODE'; mode: EditorState['mode'] }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'UPDATE_STATS'; wordCount: number; readingTime: number };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };
    case 'UPDATE_STATS':
      return { ...state, wordCount: action.wordCount, readingTime: action.readingTime };
    default:
      return state;
  }
}

function PostEditor() {
  const [editorState, dispatch] = useReducer(editorReducer, {
    mode: 'write',
    isFullscreen: false,
    wordCount: 0,
    readingTime: 0,
  });

  return (
    <div className={`${editorState.isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant={editorState.mode === 'write' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'write' })}
          >
            <Icons.edit className="mr-2 h-4 w-4" />
            Write
          </Button>
          <Button
            variant={editorState.mode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'preview' })}
          >
            <Icons.eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            variant={editorState.mode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'SET_MODE', mode: 'split' })}
          >
            <Icons.columns className="mr-2 h-4 w-4" />
            Split
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {editorState.wordCount} words · {editorState.readingTime} min read
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_FULLSCREEN' })}
          >
            {editorState.isFullscreen ? (
              <Icons.minimize className="h-4 w-4" />
            ) : (
              <Icons.maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Editor content based on mode */}
      </div>
    </div>
  );
}
```

**Perfect For:**

- Modal open/closed states
- Dropdown and tooltip visibility
- Form input focus and validation states
- Loading spinners and progress indicators
- Temporary UI feedback (hover, active states)

### 5. Authentication State - Better-auth + Router Context

**Purpose:** User authentication, sessions, and organization context

**Implementation:**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';

// Route-level authentication context
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    return {
      user: session.user,
      session,
    };
  },
});

// Component usage
function UserProfile() {
  const { user, session } = Route.useRouteContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.role === 'admin' && (
          <Badge variant="secondary">
            <Icons.shield className="mr-1 h-3 w-3" />
            Administrator
          </Badge>
        )}

        {session.activeOrganizationId && user.memberships && (
          <OrganizationSwitcher
            currentOrgId={session.activeOrganizationId}
            memberships={user.memberships}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Organization context switching
function OrganizationSwitcher({
  currentOrgId,
  memberships
}: {
  currentOrgId: string;
  memberships: Array<{
    organization: { id: string; name: string; };
    role: string;
  }>;
}) {
  const navigate = useNavigate();

  const handleOrgChange = (orgId: string) => {
    // Update session context
    switchOrganization(orgId).then(() => {
      navigate({ to: '/dashboard' });
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Active Organization</label>
      <Select value={currentOrgId} onValueChange={handleOrgChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">
            <div className="flex items-center">
              <Icons.user className="mr-2 h-4 w-4" />
              Personal
            </div>
          </SelectItem>
          {memberships.map(({ organization, role }) => (
            <SelectItem key={organization.id} value={organization.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Icons.users className="mr-2 h-4 w-4" />
                  {organization.name}
                </div>
                <Badge variant="outline" className="ml-2 text-xs">
                  {role}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

## Integration Patterns

### Search Params + TanStack Query

```typescript
import { keepPreviousData } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

function PostsPage() {
  const search = Route.useSearch();

  // Query automatically refetches when search params change
  const { data: posts, isLoading, isPlaceholderData } = useQuery({
    ...postQueries.list(search),
    // Keep previous data while loading new filters
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <PostFilters currentFilters={search} />

      {isLoading && !isPlaceholderData ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className={`${isPlaceholderData ? 'opacity-50' : ''}`}>
          <PostList posts={posts} view={search.view} />
        </div>
      )}

      <Pagination
        currentPage={search.page}
        totalPages={Math.ceil((posts?.total || 0) / search.limit)}
      />
    </div>
  );
}
```

### Forms + Server Mutations

```typescript
import { toast } from '@/components/ui/use-toast';

function CreatePostForm() {
  const form = useForm<PostFormData>();
  const navigate = useNavigate();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: postQueries.all() });

      // Show success message
      toast({
        title: 'Post created',
        description: 'Your post has been created successfully.',
      });

      // Navigate to new post
      navigate({
        to: '/posts/$postId',
        params: { postId: newPost.id }
      });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });

      // Set form errors if needed
      form.setError('root', {
        message: error.message,
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    const validationResult = PostFormSchema(data);
    if (validationResult instanceof type.errors) {
      toast({
        title: 'Validation Error',
        description: validationResult.summary,
        variant: 'destructive',
      });
      return;
    }

    createPostMutation.mutate(validationResult);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="submit" disabled={createPostMutation.isPending}>
            {createPostMutation.isPending ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
        </div>
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}
      </form>
    </Form>
  );
}
```

## When to Consider Global State

Only add global state management (like Zustand) for these specific use cases:

### Theme and User Preferences

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// If theme switching affects many components
const useThemeStore = create<{
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
```

### Toast Notifications

```typescript
import { create } from 'zustand';
import { nanoid } from '@/lib/nanoid';

type Notification = {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

const useNotificationStore = create<{
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: nanoid(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

## Performance Considerations

### Minimize Re-renders

```typescript
// Use React Hook Form's uncontrolled approach
const form = useForm(); // Minimal re-renders

// Use TanStack Query's selective subscriptions
const { data } = useQuery({
  ...postQueries.detail(id),
  select: (data) => data.title, // Only re-render when title changes
});

// Use search params efficiently
const search = Route.useSearch({
  select: (search) => search.sort, // Only re-render when sort changes
});
```

### Optimize Query Keys

```typescript
// Hierarchical keys for precise invalidation
const postQueries = {
  all: () => ['posts'] as const,
  lists: () => [...postQueries.all(), 'list'] as const,
  list: (filters: PostFilters) => [...postQueries.lists(), filters] as const,
  details: () => [...postQueries.all(), 'detail'] as const,
  detail: (id: string) => [...postQueries.details(), id] as const,
};

// Invalidate specific subsets
queryClient.invalidateQueries({ queryKey: postQueries.lists() }); // Only lists
queryClient.invalidateQueries({ queryKey: postQueries.all() }); // Everything
```

## Strategic Benefits

### 1. **Shareable State**

Users can bookmark and share exact application states:

```url
/posts?sort=popular&filter=published&category=react&view=grid
/search?q=typescript&type=posts&author=john&date=2024
```

### 2. **SEO-Friendly**

Search engines can crawl and index different application states:

```typescript
// Server-side rendering with search params
export const Route = createFileRoute('/posts/')({
  loader: async ({ search }) => {
    // Pre-fetch data based on URL params
    return await queryClient.ensureQueryData(postQueries.list(search));
  },
});
```

### 3. **Type Safety**

Complete type safety across all state layers:

```typescript
// Route validation ensures type safety
const search = Route.useSearch(); // Fully typed with Arktype
const { data } = useQuery(postQueries.list(search)); // Inferred types
```

### 4. **Minimal Bundle Size**

No additional state management libraries needed for most features:

- TanStack Query: Already included for server state
- TanStack Router: Already included for navigation
- React Hook Form: Lightweight form state only
- Arktype: Smaller than Zod, excellent performance
- React built-ins: Zero additional bytes

## Migration Strategy

If migrating from existing global state:

### 1. **Identify State Categories**

Audit existing state and categorize:

- Server data → Move to TanStack Query
- UI filters/sorting → Move to search params
- Form data → Move to React Hook Form + Arktype
- Component UI state → Move to local state

### 2. **Gradual Migration**

Migrate one feature at a time:

```typescript
// Before: Global state for posts
const posts = useGlobalState((state) => state.posts);

// After: Server state with TanStack Query
const { data: posts } = useQuery(postQueries.list());
```

### 3. **Update Patterns**

Replace imperative updates with declarative patterns:

```typescript
// Before: Manual state updates
dispatch({ type: 'SET_LOADING', payload: true });
dispatch({ type: 'SET_POSTS', payload: data });

// After: Automatic with TanStack Query
const { data: posts, isLoading } = useQuery(postQueries.list());
```

## Conclusion

This layered state management approach provides:

- **Excellent performance** with minimal re-renders
- **Type safety** across all state layers with Arktype validation
- **Shareable application state** via URLs
- **Server-side rendering** compatibility
- **Minimal complexity** with familiar patterns
- **Small bundle size** using existing dependencies
- **Beautiful UI** with consistent ShadCN/UI components

The architecture scales naturally as the application grows, with clear patterns for when to use each state management layer.

For questions or architectural decisions, refer to:

- **[Development Patterns](./index.md)** - Implementation standards
- **[Architecture Overview](../architecture/index.md)** - System design principles
- **[Component Patterns](./component-patterns.md)** - ShadCN/UI usage patterns
