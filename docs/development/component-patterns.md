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

## Best Practices Summary

1. **Always use the Icons component** instead of importing lucide-react directly
2. **Use `cn()` from `@/utils/cn`** for class name merging
3. **Import ShadCN components** from `@/components/ui/`
4. **Use `@/` aliases** for all internal imports
5. **Follow responsive design** patterns with mobile-first approach
6. **Include accessibility** attributes and semantic HTML
7. **Memoize expensive components** when needed
8. **Test component behavior** not implementation details
