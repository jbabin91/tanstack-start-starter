# Component Patterns & Usage Guide

This guide covers the project's component patterns, including ShadCN/UI usage, the Icons component, and styling utilities.

## Quick Reference

- **Icons**: Use `<Icons.iconName />` instead of importing from lucide-react
- **Styling**: Use `cn()` utility from `@/utils/cn` (NOT `@/lib/utils`)
- **Components**: Import ShadCN/UI from `@/components/ui/`
- **Imports**: Always use `@/` alias for all src imports

## Icons Component

### Using the Icons Component

The project uses a centralized Icons component instead of importing directly from lucide-react.

```typescript
import { Icons } from '@/components/icons';

// ✅ CORRECT: Use Icons component
<Icons.settings className="h-4 w-4" />
<Icons.user className="h-5 w-5 text-muted-foreground" />
<Icons.search className="h-6 w-6" />

// ❌ INCORRECT: Don't import directly from lucide-react
import { Settings, User, Search } from 'lucide-react';
```

### Available Icons

The Icons component includes commonly used icons:

```typescript
// Navigation & UI
<Icons.chevronDown />
<Icons.chevronLeft />
<Icons.chevronRight />
<Icons.chevronUp />
<Icons.search />
<Icons.settings />
<Icons.x />

// Status & Actions
<Icons.checkCircle />
<Icons.xCircle />
<Icons.alertCircle />
<Icons.alertTriangle />
<Icons.loader />
<Icons.spinner />

// Content & Media
<Icons.file />
<Icons.fileText />
<Icons.eye />
<Icons.eyeOff />
<Icons.edit />

// Users & Social
<Icons.user />
<Icons.users />
<Icons.mail />
<Icons.phone />

// Custom icons
<Icons.logo />
<Icons.react />
<Icons.tailwind />
<Icons.gitHub />
<Icons.google />
```

### Adding New Icons

To add new icons, edit `src/components/icons.tsx`:

```typescript
// 1. Import the icon with *Icon suffix
import { NewIcon } from 'lucide-react';

// 2. Add to Icons object with camelCase name
export const Icons = {
  // ... existing icons
  newIcon: NewIcon,
};

// 3. Use in components
<Icons.newIcon className="h-4 w-4" />
```

## ShadCN/UI Components

### Component Location

ShadCN/UI components are copied locally to `@/components/ui/` for full customization:

```typescript
// ✅ CORRECT: Import from local ui directory
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// ❌ INCORRECT: Don't import from node_modules
import { Button } from '@shadcn/ui/button';
```

### Component Configuration

The project uses these ShadCN/UI settings (see `components.json`):

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/app.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils/cn", // Custom: uses cn.ts instead of utils.ts
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Common Components

#### Button Component

```typescript
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button color="error">Delete</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icons.settings /></Button>

// With icons
<Button>
  <Icons.plus className="h-4 w-4 mr-2" />
  Add Post
</Button>
```

#### Card Component

```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Post Title</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Dialog Component

```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

## The `cn` Utility

### Usage

The project uses a custom `cn` utility at `@/utils/cn` instead of the default `@/lib/utils`:

```typescript
import { cn } from '@/utils/cn';

// ✅ CORRECT: Import from @/utils/cn
function MyComponent({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center p-4', className)}>
      Content
    </div>
  );
}

// ❌ INCORRECT: Don't import from @/lib/utils
import { cn } from '@/lib/utils';
```

### Implementation

The `cn` utility merges Tailwind classes intelligently:

```typescript
// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### Examples

```typescript
// Conditional classes
const isActive = true;
cn('px-4 py-2', isActive && 'bg-blue-500', 'text-white')

// Merging conflicting classes (twMerge resolves conflicts)
cn('p-4 p-6') // Results in 'p-6'
cn('bg-red-500 bg-blue-500') // Results in 'bg-blue-500'

// With arrays and objects
cn(['flex', 'items-center'], { 'justify-center': centered })

// Component composition
function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-white',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'lg' && 'px-6 py-3 text-lg',
        className,
      )}
      {...props}
    />
  );
}
```

## Component Composition Patterns

### Layout Components

```typescript
// src/components/layouts/page-layout.tsx
import { cn } from '@/utils/cn';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

function PageLayout({ children, className, title }: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {title && (
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
        </header>
      )}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

### Loading States

```typescript
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Icons.spinner className={cn('animate-spin h-4 w-4', className)} />
  );
}

function LoadingButton({
  children,
  isLoading,
  ...props
}: ButtonProps & { isLoading?: boolean }) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && <LoadingSpinner className="mr-2" />}
      {children}
    </Button>
  );
}
```

### Form Components

```typescript
// Using React Hook Form with ShadCN components
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function MyForm() {
  const form = useForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          <Icons.save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </form>
    </Form>
  );
}
```

## Styling Guidelines

### Responsive Design

```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

### Dark Mode Support

```typescript
// Use CSS variables for theme-aware colors
<div className="bg-background text-foreground">
  <Card className="border-border">
    <CardContent className="text-muted-foreground">
      Content with theme colors
    </CardContent>
  </Card>
</div>
```

### Accessibility

```typescript
// Include proper ARIA attributes
<Button
  aria-label="Delete post"
  aria-describedby="delete-help"
>
  <Icons.trash className="h-4 w-4" />
</Button>

// Use semantic HTML
<nav aria-label="Main navigation">
  <ul className="flex space-x-4">
    <li><a href="/posts">Posts</a></li>
    <li><a href="/settings">Settings</a></li>
  </ul>
</nav>
```

## Performance Considerations

### Component Memoization

```typescript
import { memo } from 'react';

// Memoize expensive components
const PostCard = memo(function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {post.content}
      </CardContent>
    </Card>
  );
});
```

### Icon Optimization

```typescript
// Icons are tree-shaken automatically through the Icons component
// Only imported icons are included in the bundle

// If you need a one-off icon, import directly
import { RareIcon } from 'lucide-react';
```

## Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with icon', () => {
  render(
    <Button>
      <Icons.plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  );

  expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
});
```

## Search & Discovery Component Patterns

### Advanced Filter Panel Components

The platform includes a comprehensive filtering system for search and content discovery. These patterns are documented for the search & discovery features.

#### Filter Panel Architecture

```typescript
// src/components/search/filters/filter-panel.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FilterPanelProps {
  contentType: string;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

function FilterPanel({ contentType, onFiltersChange, className }: FilterPanelProps) {
  const {
    filterConfig,
    activeFilterCount,
    hasActiveFilters,
    updateFilter,
    clearAllFilters,
    getFilterValue,
    toSearchFilters,
  } = useSearchFilters(contentType);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(
      filterConfig
        .filter(group => group.defaultExpanded)
        .map(group => group.id)
    )
  );

  const handleFilterChange = (filterId: string, value: FilterValue) => {
    updateFilter(filterId, value);
    // Debounce the API call
    setTimeout(() => {
      onFiltersChange(toSearchFilters());
    }, 300);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filterConfig.map(group => (
          <div key={group.id}>
            {group.collapsible ? (
              <Collapsible
                open={expandedGroups.has(group.id)}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between p-2 h-auto"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{group.label}</span>
                    </div>
                    {expandedGroups.has(group.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <FilterGroup
                    group={group}
                    values={getFilterValue}
                    onChange={handleFilterChange}
                  />
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <FilterGroup
                group={group}
                values={getFilterValue}
                onChange={handleFilterChange}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

#### Filter State Management Hook

```typescript
// src/modules/search/hooks/use-search-filters.ts
import { useState, useCallback, useMemo } from 'react';
import type { BaseFilter, FilterValue } from '@/modules/search/types/filters';
import { searchFilterConfig } from '@/modules/search/config/filter-config';

export interface FilterState {
  [filterId: string]: FilterValue;
}

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

      // Update active filter count
      const count = Object.keys(newFilters).filter((key) => {
        const filterValue = newFilters[key];
        return (
          filterValue !== undefined &&
          filterValue !== '' &&
          (!Array.isArray(filterValue) || filterValue.length > 0)
        );
      }).length;

      setActiveFilterCount(count);

      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setActiveFilterCount(0);
  }, []);

  // Convert filter state to search API format
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
    hasActiveFilters: activeFilterCount > 0,
    updateFilter,
    clearAllFilters,
    getFilterValue: useCallback(
      (filterId: string) => filters[filterId],
      [filters],
    ),
    toSearchFilters,
  };
}
```

#### Real-time Search Hook Pattern

```typescript
// src/modules/search/hooks/use-realtime-search.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchQueries } from '@/modules/search/hooks/use-queries';

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

  return {
    // State
    filters,
    debouncedFilters,
    isTyping,

    // Query state
    results: searchQuery.data?.results || [],
    totalCount: searchQuery.data?.totalCount || 0,
    isLoading: searchQuery.isLoading || isTyping,
    isError: searchQuery.isError,
    error: searchQuery.error,

    // Actions
    updateFilters,
    updateQuery,
    clearSearch: useCallback(() => {
      setFilters({});
      setDebouncedFilters({});
    }, []),
    refetch: searchQuery.refetch,
  };
}
```

### Search Interface Components

#### Search Result Components

```typescript
// src/components/search/search-result-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/utils/cn';

interface SearchResultCardProps {
  result: SearchResult;
  onResultClick?: (result: SearchResult, position: number) => void;
  position: number;
  className?: string;
}

function SearchResultCard({ result, onResultClick, position, className }: SearchResultCardProps) {
  const handleClick = () => {
    onResultClick?.(result, position);
  };

  return (
    <Card
      className={cn('cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">
            {result.title || result.name}
          </CardTitle>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {result.type}
          </Badge>
        </div>
        {result.type === 'post' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icons.user className="h-3 w-3" />
            <span>{result.author?.name}</span>
            {result.organization && (
              <>
                <span>•</span>
                <span>{result.organization.name}</span>
              </>
            )}
            <span>•</span>
            <span>{result.readingTime} min read</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {result.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {result.excerpt}
          </p>
        )}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {result.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{result.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Search Analytics Hook

```typescript
// src/modules/search/hooks/use-search-analytics.ts
import { useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { SearchFilters, SearchResult } from '@/modules/search/types';

export function useSearchAnalytics() {
  const posthog = usePostHog();

  const trackSearch = useCallback(
    (filters: SearchFilters, resultCount: number, duration: number) => {
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
      });
    },
    [posthog],
  );

  const trackFilterUsage = useCallback(
    (filterId: string, value: unknown) => {
      posthog?.capture('search_filter_applied', {
        filter_id: filterId,
        filter_type: typeof value,
        is_array: Array.isArray(value),
        value_count: Array.isArray(value) ? value.length : 1,
      });
    },
    [posthog],
  );

  const trackResultClick = useCallback(
    (result: SearchResult, position: number, query?: string) => {
      posthog?.capture('search_result_clicked', {
        result_type: result.type,
        result_id: result.id,
        position,
        query,
        query_length: query?.length || 0,
        relevance_score: result.relevanceScore,
      });
    },
    [posthog],
  );

  return {
    trackSearch,
    trackFilterUsage,
    trackResultClick,
  };
}
```

## Editor Component Patterns

### Markdown Editor Components

For content creation features, the platform includes specialized editor components following these patterns:

#### Auto-save Hook Pattern

```typescript
// src/modules/editor/hooks/use-auto-save.ts
import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { saveDraft } from '@/modules/posts/api/save-draft';

interface UseAutoSaveOptions {
  interval?: number;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave(
  content: string,
  draftId?: string,
  options: UseAutoSaveOptions = {},
) {
  const { interval = 10000, debounceMs = 2000, enabled = true } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastSavedContent = useRef(content);

  const saveMutation = useMutation({
    mutationFn: saveDraft,
    onSuccess: () => {
      lastSavedContent.current = content;
    },
  });

  const performSave = useCallback(() => {
    if (content !== lastSavedContent.current && draftId) {
      saveMutation.mutate({ draftId, content });
    }
  }, [content, draftId, saveMutation]);

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

    intervalRef.current = setInterval(performSave, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [performSave, interval, enabled]);

  return {
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    lastSaved: saveMutation.isSuccess ? new Date() : null,
    forceSave: performSave,
  };
}
```

#### Editor Status Bar Component

```typescript
// src/components/editor/editor-status-bar.tsx
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/utils/cn';

interface EditorStatusBarProps {
  wordCount: number;
  readingTime: number;
  isSaving?: boolean;
  saveError?: Error | null;
  lastSaved?: Date | null;
  className?: string;
}

function EditorStatusBar({
  wordCount,
  readingTime,
  isSaving,
  saveError,
  lastSaved,
  className,
}: EditorStatusBarProps) {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just saved';
    if (diffMins === 1) return '1 min ago';
    return `${diffMins} min ago`;
  };

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2 border-t bg-muted/30',
      className
    )}>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>📊 Words: {wordCount}</span>
        <span>Reading time: {readingTime} min</span>
      </div>

      <div className="flex items-center gap-2">
        {isSaving && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Icons.spinner className="h-3 w-3 animate-spin" />
            Saving...
          </Badge>
        )}

        {saveError && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Icons.alertCircle className="h-3 w-3" />
            Failed to save
          </Badge>
        )}

        {!isSaving && !saveError && lastSaved && (
          <span className="text-xs text-muted-foreground">
            Last saved: {formatLastSaved(lastSaved)}
          </span>
        )}
      </div>
    </div>
  );
}
```

## Best Practices Summary

1. **Always use the Icons component** instead of importing lucide-react directly
2. **Use `cn()` from `@/utils/cn`** for class name merging
3. **Import ShadCN components** from `@/components/ui/`
4. **Use `@/` aliases** for all internal imports
5. **Follow responsive design** patterns with mobile-first approach
6. **Include accessibility** attributes and semantic HTML
7. **Memoize expensive components** when needed
8. **Test component behavior** not implementation details
9. **Use debounced hooks** for search and auto-save functionality
10. **Implement proper loading states** with visual feedback
11. **Track analytics events** for user behavior insights
12. **Use collapsible patterns** for complex filter interfaces
