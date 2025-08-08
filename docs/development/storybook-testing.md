# Storybook Testing Patterns & Accessibility Compliance

This guide covers comprehensive testing patterns for Storybook stories, focusing on common issues and solutions discovered during component testing and accessibility compliance.

## Table of Contents

1. [Portal Component Testing](#portal-component-testing)
2. [Animation Timing Handling](#animation-timing-handling)
3. [ARIA Compliance Requirements](#aria-compliance-requirements)
4. [Common Test Failures and Solutions](#common-test-failures-and-solutions)
5. [Required Imports](#required-imports)
6. [Testing Patterns Reference](#testing-patterns-reference)

## Portal Component Testing

Components that render in portals (Select, Dialog, Tooltip) require special testing approaches since they render outside the Storybook canvas.

### The Problem

Portal components render outside `storybook-root`, causing tests to fail when searching within `canvasElement`:

```typescript
// ❌ WRONG - Portal elements won't be found
export const InteractiveTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    // This will fail - portal content isn't in canvasElement
    expect(canvas.getByRole('option')).toBeVisible();
  },
};
```

### The Solution

Use `within(document.body)` to search the entire document for portal content:

```typescript
// ✅ CORRECT - Portal testing pattern
export const InteractiveTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Trigger opens within canvas
    await userEvent.click(canvas.getByRole('combobox'));

    // Portal content searched in document body
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    // Select an option
    await userEvent.click(screen.getByRole('option', { name: 'Option 1' }));

    // Verify selection in canvas
    expect(canvas.getByDisplayValue('Option 1')).toBeVisible();
  },
};
```

### Portal Components Requiring This Pattern

- **Select**: Dropdown options render in portal
- **Dialog**: Modal content renders in portal
- **Tooltip**: Tooltip content renders in portal
- **Popover**: Popover content renders in portal
- **Command**: Command palette renders in portal

## Animation Timing Handling

Components with animations require careful timing and flexible assertions to handle transitional states.

### The Problem

Elements may have `data-state="open"` but still be transitioning, causing visibility checks to fail:

```typescript
// ❌ WRONG - Doesn't account for animation timing
await userEvent.click(trigger);
expect(screen.getByRole('dialog')).toBeVisible(); // Might fail during transition
```

### The Solution

Use `waitFor()` with appropriate delays and flexible assertions:

```typescript
// ✅ CORRECT - Animation-aware testing
export const AnimatedComponent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Open with animation
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));

    // Wait for animation to complete
    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeVisible();
      },
      { timeout: 1000 },
    );

    // Close with animation
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    // Flexible assertion for exit animation
    await waitFor(
      () => {
        const dialog = screen.queryByRole('dialog');
        // Element might be hidden OR removed during exit
        expect(dialog).toSatisfy((el) => el === null || !el.checkVisibility());
      },
      { timeout: 1000 },
    );
  },
};
```

### Animation Timing Patterns

**For Opening Animations:**

```typescript
// Pattern 1: waitFor with timeout
await waitFor(
  () => {
    expect(element).toBeVisible();
  },
  { timeout: 1000 },
);

// Pattern 2: Combined with setTimeout for complex animations
await new Promise((resolve) => setTimeout(resolve, 300));
await waitFor(() => {
  expect(element).toBeVisible();
});
```

**For Closing Animations:**

```typescript
// Flexible assertion for exit states
await waitFor(
  () => {
    const element = screen.queryByRole('dialog');
    expect(element).toSatisfy((el) => el === null || !el.checkVisibility());
  },
  { timeout: 1000 },
);
```

## ARIA Compliance Requirements

Proper ARIA implementation is crucial for accessibility and prevents testing failures.

### Form Field ARIA Requirements

All form fields must have proper ARIA relationships:

```typescript
// ✅ CORRECT - Complete form field with ARIA
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email Address</FormLabel>
      <FormControl>
        <Input {...field} type="email" />
      </FormControl>
      <FormDescription>
        We&apos;ll use this to send you important updates
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Key Requirements:**

- `FormLabel` provides `aria-labelledby`
- `FormDescription` provides `aria-describedby`
- `FormMessage` provides error `aria-describedby`
- All relationships are automatically managed by shadcn/ui

### Select Component ARIA

Select components need explicit labeling:

```typescript
// ✅ CORRECT - Select with proper ARIA
<Select>
  <SelectTrigger aria-label="Choose framework preference">
    <SelectValue placeholder="Select framework" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="react">React</SelectItem>
    <SelectItem value="vue">Vue</SelectItem>
  </SelectContent>
</Select>
```

### Unique ID Requirements

Each story must use unique IDs to prevent conflicts:

```typescript
// ❌ WRONG - Duplicate IDs across stories
<div id="error-message">Error text</div>

// ✅ CORRECT - Story-scoped unique IDs
<div id={`error-message-${Math.random()}`}>Error text</div>

// Or use a story-specific prefix
<div id="form-error-message">Error text</div>
```

## Common Test Failures and Solutions

### Multiple Elements Found

**Problem:** Tests find multiple elements with the same text or role.

```typescript
// ❌ WRONG - Ambiguous selector
expect(screen.getByText('Settings')).toBeVisible();
// Error: Found multiple elements with text 'Settings'
```

**Solution:** Scope searches within specific containers or use more specific selectors.

```typescript
// ✅ CORRECT - Scoped search
const dialog = screen.getByRole('dialog');
expect(within(dialog).getByText('Settings')).toBeVisible();

// Or use more specific role
expect(screen.getByRole('heading', { name: 'Settings' })).toBeVisible();
```

### Element Not Found in Portal

**Problem:** Portal content not found when searching in canvas.

```typescript
// ❌ WRONG
const canvas = within(canvasElement);
expect(canvas.getByRole('tooltip')).toBeVisible(); // Tooltip is in portal
```

**Solution:** Use document body for portal content.

```typescript
// ✅ CORRECT
const screen = within(document.body);
expect(screen.getByRole('tooltip')).toBeVisible();
```

### Timing Assertion Failures

**Problem:** Elements found but not visible due to animations.

```typescript
// ❌ WRONG
await userEvent.click(trigger);
expect(screen.getByRole('dialog')).toBeVisible(); // Might be transitioning
```

**Solution:** Use waitFor with appropriate timeouts.

```typescript
// ✅ CORRECT
await userEvent.click(trigger);
await waitFor(
  () => {
    expect(screen.getByRole('dialog')).toBeVisible();
  },
  { timeout: 1000 },
);
```

### ARIA Violations

**Problem:** Missing ARIA relationships cause accessibility violations.

```typescript
// ❌ WRONG - Missing FormDescription
<FormItem>
  <FormLabel>Email</FormLabel>
  <FormControl>
    <Input {...field} />
  </FormControl>
  <FormMessage />
</FormItem>
```

**Solution:** Include all required form components.

```typescript
// ✅ CORRECT - Complete ARIA relationships
<FormItem>
  <FormLabel>Email</FormLabel>
  <FormControl>
    <Input {...field} />
  </FormControl>
  <FormDescription>Enter your email address</FormDescription>
  <FormMessage />
</FormItem>
```

## Required Imports

Essential imports for comprehensive Storybook testing:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { fn } from '@storybook/test';

// For form testing
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Component imports
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
```

## Testing Patterns Reference

### Portal Component Test Template

```typescript
export const PortalComponentTest: Story = {
  args: {
    onOpenChange: fn(),
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // 1. Trigger action in canvas
    await userEvent.click(canvas.getByRole('combobox'));

    // 2. Wait for portal content
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    // 3. Interact with portal content
    await userEvent.click(screen.getByRole('option', { name: 'Option 1' }));

    // 4. Verify callback called
    expect(args.onValueChange).toHaveBeenCalledWith('option1');

    // 5. Verify canvas state updated
    expect(canvas.getByDisplayValue('Option 1')).toBeVisible();
  },
};
```

### Animated Component Test Template

```typescript
export const AnimatedComponentTest: Story = {
  args: {
    onOpenChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Open
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));

    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeVisible();
      },
      { timeout: 1000 },
    );

    expect(args.onOpenChange).toHaveBeenCalledWith(true);

    // Close
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(
      () => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).toSatisfy((el) => el === null || !el.checkVisibility());
      },
      { timeout: 1000 },
    );

    expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
```

### Form Component Test Template

```typescript
const FormSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const FormTest: Story = {
  render: (args) => {
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        email: '',
        message: '',
      },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(args.onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="your@email.com" />
                </FormControl>
                <FormDescription>
                  We&apos;ll use this to send you updates
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Your message..." />
                </FormControl>
                <FormDescription>
                  Share your thoughts with us
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send Message</Button>
        </form>
      </Form>
    );
  },
  args: {
    onSubmit: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Test validation
    await userEvent.click(canvas.getByRole('button', { name: 'Send Message' }));

    await waitFor(() => {
      expect(canvas.getByText('Invalid email address')).toBeVisible();
      expect(canvas.getByText('Message must be at least 10 characters')).toBeVisible();
    });

    // Test valid submission
    await userEvent.type(canvas.getByLabelText('Email Address'), 'test@example.com');
    await userEvent.type(canvas.getByLabelText('Message'), 'This is a test message that is long enough');

    await userEvent.click(canvas.getByRole('button', { name: 'Send Message' }));

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        message: 'This is a test message that is long enough',
      });
    });
  },
};
```

## Best Practices Summary

1. **Portal Components**: Always use `within(document.body)` for portal content
2. **Animations**: Use `waitFor()` with appropriate timeouts and flexible assertions
3. **ARIA**: Include all required form components for proper accessibility
4. **Unique IDs**: Prevent conflicts with story-specific or random IDs
5. **Scoped Searches**: Use specific containers to avoid multiple element errors
6. **Callback Testing**: Verify all interactive callbacks are called correctly
7. **State Verification**: Check both portal and canvas state changes
8. **Error Handling**: Test both success and validation failure scenarios

Following these patterns ensures reliable, accessible, and comprehensive component testing in Storybook.
