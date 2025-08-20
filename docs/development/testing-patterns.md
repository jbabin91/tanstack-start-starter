# Testing Patterns & Accessibility Compliance

This guide covers comprehensive testing patterns for all testing in the project, including Storybook stories, Vitest unit tests, and end-to-end testing. These patterns ensure accessibility compliance and robust testing practices across all test environments.

## Table of Contents

1. [Testing Library Query Priority](#testing-library-query-priority)
2. [Testing Across Environments](#testing-across-environments)
3. [Portal Component Testing](#portal-component-testing)
4. [Animation Timing Handling](#animation-timing-handling)
5. [ARIA Compliance Requirements](#aria-compliance-requirements)
6. [Common Test Failures and Solutions](#common-test-failures-and-solutions)
7. [Required Imports](#required-imports)
8. [Testing Patterns Reference](#testing-patterns-reference)

## Testing Library Query Priority

Based on Testing Library's Guiding Principles, your test should resemble how users interact with your code as much as possible. Always follow this priority order when selecting elements in your tests:

### 1. Queries Accessible to Everyone

These queries reflect the experience of both visual/mouse users and those using assistive technology.

#### `getByRole` - **TOP PRIORITY**

Query elements exposed in the accessibility tree. Use the `name` option to filter by accessible name.

```typescript
// ✅ PREFERRED - Most accessible and user-focused
const submitButton = canvas.getByRole('button', { name: /submit/i });
const selectTrigger = canvas.getByRole('combobox', { name: 'Select fruit' });
const dialog = within(document.body).getByRole('dialog');
const tabTrigger = canvas.getByRole('tab', { name: 'Settings' });

// Common roles: button, textbox, combobox, dialog, tab, tabpanel, link, heading, etc.
```

#### `getByLabelText` - Form fields

Ideal for form fields as users navigate forms using label text.

```typescript
// ✅ EXCELLENT for forms
const emailInput = canvas.getByLabelText('Email Address');
const passwordField = canvas.getByLabelText(/password/i);
```

#### `getByPlaceholderText` - Fallback for forms

Use when labels aren't available (though placeholders aren't substitutes for labels).

```typescript
// ⚠️ USE SPARINGLY - Only when no label exists
const searchInput = canvas.getByPlaceholderText('Search posts...');
```

#### `getByText` - Non-interactive content

Main way users find non-interactive elements outside of forms.

```typescript
// ✅ GOOD for content verification
const heading = canvas.getByText('User Settings');
const description = canvas.getByText(/configure your preferences/i);
```

#### `getByDisplayValue` - Form values

Useful for form elements with filled-in values.

```typescript
// ✅ GOOD for checking form state
const nameInput = canvas.getByDisplayValue('John Doe');
```

### 2. Semantic Queries

HTML5 and ARIA compliant selectors. Note that user experience varies across browsers and assistive technology.

#### `getByAltText` - Images and media

For elements that support alt text (img, area, input, custom elements).

```typescript
// ✅ GOOD for images
const profileImage = canvas.getByAltText('User profile photo');
```

#### `getByTitle` - Title attributes

Title attributes aren't consistently read by screen readers and aren't visible by default.

```typescript
// ⚠️ USE SPARINGLY - Not consistently accessible
const helpIcon = canvas.getByTitle('Help information');
```

### 3. Test IDs - **LAST RESORT**

Users cannot see or hear these. Only use when you can't match by role, text, or when it doesn't make sense (e.g., dynamic text).

```typescript
// ❌ AVOID - Only use as absolute last resort
const dynamicElement = canvas.getByTestId('complex-widget-' + Math.random());
```

### Query Priority Examples

```typescript
// ✅ EXCELLENT - Semantic, accessible queries
export const AccessibleTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Use role-based queries first
    const openButton = canvas.getByRole('button', { name: 'Open Dialog' });
    await userEvent.click(openButton);

    // 2. Portal content - search in document body
    const dialog = within(document.body).getByRole('dialog');
    expect(dialog).toBeVisible();

    // 3. Form interactions with labels
    const emailField = within(dialog).getByLabelText('Email Address');
    await userEvent.type(emailField, 'user@example.com');

    // 4. Content verification with text
    expect(within(dialog).getByText('Welcome')).toBeVisible();

    // 5. Close dialog
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
  },
};

// ❌ BAD - Test ID focused queries
export const BadTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Don't do this - uses test IDs exclusively
    await userEvent.click(canvas.getByTestId('open-button'));
    expect(within(document.body).getByTestId('dialog')).toBeVisible();
    // This doesn't test accessibility or user experience
  },
};
```

### Migration Strategy

When updating existing tests:

1. **Identify the element's purpose** - Is it a button, form field, heading, etc.?
2. **Check the accessibility tree** - What role does it have?
3. **Look for labels or text content** - How would a user identify it?
4. **Replace test IDs progressively** - Start with the most critical interactions
5. **Remove data-testid attributes** - Clean up templates once tests are updated

```typescript
// Before: Test ID approach
const trigger = canvas.getByTestId('select-trigger');
const option = within(document.body).getByTestId('option-1');

// After: Semantic approach
const trigger = canvas.getByRole('combobox', { name: 'Choose option' });
const option = within(document.body).getByRole('option', { name: 'Option 1' });
```

### Benefits of Semantic Testing

- **Accessibility compliance** - Tests verify that assistive technology can interact with components
- **User-focused** - Tests reflect real user behavior and interaction patterns
- **Maintainable** - Less brittle than test IDs, survives refactoring better
- **Documentation** - Tests serve as living documentation of component accessibility
- **WCAG compliance** - Helps ensure components meet accessibility standards

## Testing Across Environments

These query priority guidelines apply uniformly across all testing environments in the project. Here's how to implement them in each context:

### Storybook Stories (`.stories.tsx`)

```typescript
// In play functions
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body); // For portal content

    // ✅ Use semantic queries consistently
    const button = canvas.getByRole('button', { name: 'Submit' });
    const dialog = screen.getByRole('dialog'); // Portal content

    await userEvent.click(button);
    await expect(dialog).toBeVisible();
  },
};
```

### Vitest Unit Tests (`.test.tsx`)

```typescript
// Component testing with @testing-library/react
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits form with valid data', async () => {
  render(<ContactForm onSubmit={mockSubmit} />);

  // ✅ Same query patterns as Storybook
  const emailInput = screen.getByRole('textbox', { name: 'Email Address' });
  const submitButton = screen.getByRole('button', { name: 'Send Message' });

  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.click(submitButton);

  expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
});
```

### End-to-End Tests (Playwright/Cypress)

```typescript
// Playwright example
test('user can complete checkout flow', async ({ page }) => {
  await page.goto('/checkout');

  // ✅ Same semantic approach with Playwright locators
  await page
    .getByRole('textbox', { name: 'Email Address' })
    .fill('user@test.com');
  await page.getByRole('button', { name: 'Continue to Payment' }).click();

  // Wait for navigation/portal content
  await page.getByRole('dialog', { name: 'Payment Details' }).waitFor();
});

// Cypress example
it('navigates between tabs', () => {
  cy.visit('/dashboard');

  // ✅ Same semantic queries in Cypress
  cy.findByRole('tab', { name: 'Analytics' }).click();
  cy.findByRole('tabpanel', { name: 'Analytics' }).should('be.visible');
});
```

### Benefits of Consistent Query Strategy

1. **Team Knowledge Transfer** - Developers familiar with one test environment can easily work with others
2. **Shared Debugging Skills** - Similar failure patterns across all test types
3. **Accessibility Consistency** - All tests enforce the same accessibility standards
4. **Migration Ease** - Moving tests between environments requires minimal changes
5. **Documentation Value** - All tests serve as accessibility documentation

### Environment-Specific Considerations

#### Storybook Specific

- Use `within(document.body)` for portal components (Dialog, Select, Tooltip)
- Handle animation timing with `waitFor()` and appropriate timeouts
- Test isolated components with controlled props

#### Vitest Specific

- Mock external dependencies and services
- Focus on component logic and edge cases
- Test error boundaries and loading states

#### E2E Specific

- Test full user workflows and integration points
- Handle network timing and real data
- Verify cross-browser compatibility

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

### Query Priority (MANDATORY)

1. **Use `getByRole` first** - Most accessible and user-focused query method
2. **Use `getByLabelText`** - Essential for form fields and labels
3. **Use `getByText`** - Good for non-interactive content verification
4. **Avoid `getByTestId`** - Only use as absolute last resort for dynamic content
5. **Follow Testing Library priority** - Accessibility queries > Semantic queries > Test IDs

### Technical Implementation

6. **Portal Components**: Always use `within(document.body)` for portal content
7. **Animations**: Use `waitFor()` with appropriate timeouts and flexible assertions
8. **ARIA**: Include all required form components for proper accessibility
9. **Unique IDs**: Prevent conflicts with story-specific or random IDs
10. **Scoped Searches**: Use specific containers to avoid multiple element errors
11. **Callback Testing**: Verify all interactive callbacks are called correctly
12. **State Verification**: Check both portal and canvas state changes
13. **Error Handling**: Test both success and validation failure scenarios

### Migration Guidelines

14. **Remove data-testid attributes** - Clean up component templates after updating tests
15. **Use accessible names** - Ensure elements have proper aria-label or text content
16. **Test like users** - Focus on how real users interact with components
17. **Document accessibility** - Tests serve as living accessibility documentation

Following these patterns ensures reliable, accessible, and comprehensive component testing in Storybook while maintaining WCAG compliance.
