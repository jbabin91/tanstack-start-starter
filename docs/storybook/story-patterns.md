# Storybook Story Patterns Reference

This document provides reference examples and detailed patterns. **For mandatory story creation processes, see CLAUDE.md MANDATORY WORKFLOW PROCESSES section.**

## Core Patterns

### Story File Structure

Every story file follows this structure:

```typescript
// src/components/ui/[component]/[component].stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { expect, within } from '@storybook/test';

import { Component } from './component';

const meta: Meta<typeof Component> = {
  title: 'UI/[Category]/[ComponentName]', // MUI-aligned categorization
  component: Component,
  parameters: {
    layout: 'centered', // or 'padded', 'fullscreen'
    docs: {
      description: {
        component: 'Brief component description.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Detailed arg descriptions for better UX
    propName: {
      description: 'Detailed description of what this prop does',
      control: 'select',
      options: ['option1', 'option2'],
    },
  },
  args: {
    // Default args applied to all stories
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Export pattern: [Purpose][ComponentName]
export const DefaultButton: Story = {
  args: {
    children: 'Button',
  },
};
```

### Component Categorization

Stories are organized using a hierarchical category system:

```typescript
// Inputs
'UI/Inputs/Button';
'UI/Inputs/TextField';
'UI/Inputs/Checkbox';

// Surfaces
'UI/Surfaces/Card';
'UI/Surfaces/Accordion';
'UI/Surfaces/Paper';

// Data Display
'UI/Data Display/Badge';
'UI/Data Display/Avatar';
'UI/Data Display/Typography';

// Feedback
'UI/Feedback/Alert';
'UI/Feedback/Progress';
'UI/Feedback/Skeleton';

// Navigation
'UI/Navigation/Breadcrumb';
'UI/Navigation/Menu';
'UI/Navigation/Tabs';

// Layout
'UI/Layout/Container';
'UI/Layout/Grid';
'UI/Layout/Stack';
```

## Story Naming Conventions

### Export Naming Pattern

Use descriptive, purpose-driven names:

```typescript
// ✅ GOOD: Clear purpose and context
export const DefaultButton: Story = {};
export const PrimaryButton: Story = {};
export const ErrorButton: Story = {};
export const WithIcon: Story = {};
export const LoadingState: Story = {};

// ✅ GOOD: Real-world scenarios
export const LoginForm: Story = {};
export const ShoppingCart: Story = {};
export const DangerousAction: Story = {};

// ❌ AVOID: Generic or unclear names
export const Story1: Story = {};
export const Test: Story = {};
export const Example: Story = {};
```

### Story Categories

Group stories by purpose:

1. **Variants** - Different visual styles (`Primary`, `Secondary`, `Error`)
2. **States** - Different component states (`Loading`, `Disabled`, `Active`)
3. **Interactions** - Interactive examples (`WithClick`, `WithHover`)
4. **Real-world** - Practical use cases (`LoginForm`, `ProductCard`)
5. **Edge cases** - Boundary conditions (`LongText`, `EmptyState`)

## Args vs Render Patterns

### When to Use `args`

Use `args` for simple prop changes:

```typescript
export const PrimaryButton: Story = {
  args: {
    color: 'primary',
    children: 'Primary Button',
  },
};

export const SmallButton: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};
```

### When to Use `render`

Use `render` for complex compositions or multiple components:

```typescript
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Icons.plus className="mr-2 h-4 w-4" />
      Add Item
    </Button>
  ),
};

export const ButtonGroup: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <Button {...args} color="primary">Primary</Button>
      <Button {...args} color="secondary">Secondary</Button>
      <Button {...args} color="error">Error</Button>
    </div>
  ),
};

export const RealWorldForm: Story = {
  render: (args) => (
    <form className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input type="email" placeholder="Enter your email" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <Input type="password" placeholder="Enter your password" />
      </div>
      <Button {...args} className="w-full" color="primary">
        Sign In
      </Button>
    </form>
  ),
  parameters: {
    layout: 'centered',
  },
};
```

## Component Testing Patterns

**Note**: These patterns follow the project's universal [Testing Library query priority guidelines](../development/testing-patterns.md#testing-library-query-priority). Always use semantic queries (`getByRole`, `getByLabelText`) over test IDs.

### Basic Interaction Testing

Every interactive story should include a play function:

```typescript
export const Interactive: Story = {
  args: {
    children: 'Click me',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

### Complex Interaction Testing

For more complex interactions:

```typescript
export const FormInteraction: Story = {
  render: () => (
    <form>
      <Input type="email" placeholder="Enter your email address" aria-label="Email address" />
      <Input type="password" placeholder="Enter your password" aria-label="Password" />
      <Button type="submit">Submit</Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ✅ Use semantic queries - more accessible and user-focused
    const emailInput = canvas.getByRole('textbox', { name: 'Email address' });
    const passwordInput = canvas.getByLabelText('Password');
    const submitButton = canvas.getByRole('button', { name: 'Submit' });

    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Verify interactions occurred
    await expect(emailInput).toHaveValue('user@example.com');
    await expect(passwordInput).toHaveValue('password123');
  },
};
```

## Storybook-Specific Testing Patterns

### Portal Component Testing

Components that render in portals (Select, Dialog, Tooltip) require special testing approaches since they render outside the Storybook canvas.

#### The Problem

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

#### The Solution

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

#### Portal Components Requiring This Pattern

- **Select**: Dropdown options render in portal
- **Dialog**: Modal content renders in portal
- **Tooltip**: Tooltip content renders in portal
- **Popover**: Popover content renders in portal
- **Command**: Command palette renders in portal

### Animation Timing Handling

Components with animations require careful timing and flexible assertions to handle transitional states.

#### The Problem

Elements may have `data-state="open"` but still be transitioning, causing visibility checks to fail:

```typescript
// ❌ WRONG - Doesn't account for animation timing
await userEvent.click(trigger);
expect(screen.getByRole('dialog')).toBeVisible(); // Might fail during transition
```

#### The Solution

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

#### Animation Timing Patterns

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

### Common Storybook Test Failures and Solutions

#### Multiple Elements Found

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

#### Element Not Found in Portal

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

#### Timing Assertion Failures

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

### Required Storybook Test Imports

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

## ArgTypes Configuration

### Comprehensive ArgTypes Example

```typescript
const meta: Meta<typeof Button> = {
  // ... other config
  argTypes: {
    color: {
      description:
        'The color theme of the button. Affects background, text, and hover states.',
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    variant: {
      description:
        'The visual variant of the button. Controls styling approach.',
      control: 'select',
      options: ['contained', 'outlined', 'text', 'link'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'contained' },
      },
    },
    size: {
      description: 'The size of the button. Affects padding and font size.',
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      description:
        'When true, prevents user interaction and applies disabled styling.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      description: 'Callback fired when the button is clicked.',
      action: 'clicked',
      table: {
        type: { summary: '() => void' },
      },
    },
    children: {
      description: 'The content to display inside the button.',
      control: 'text',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the button.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};
```

## Parameters Configuration

### Layout Options

```typescript
// Centered - Default for most UI components
parameters: {
  layout: 'centered',
}

// Padded - For components that need more space
parameters: {
  layout: 'padded',
}

// Fullscreen - For layouts and page components
parameters: {
  layout: 'fullscreen',
}
```

### Documentation Configuration

```typescript
parameters: {
  docs: {
    description: {
      component: 'A comprehensive description of the component, its purpose, and main use cases.',
      story: 'Specific description for this story variant.',
    },
  },
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/...', // Optional design reference
  },
}
```

## Real-World Example Stories

### Form Components

```typescript
export const ContactForm: Story = {
  render: () => (
    <Card className="w-96 p-6">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>Send us a message and we'll get back to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your@email.com" />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Your message..." className="min-h-24" />
        </div>
        <div className="flex gap-2">
          <Button color="primary" className="flex-1">Send Message</Button>
          <Button variant="outlined" className="flex-1">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'A complete contact form showing how Button integrates with other form components.',
      },
    },
  },
};
```

### Status and Feedback

```typescript
export const StatusIndicators: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Badge variant="success">Active</Badge>
        <span>Service is running normally</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="warning">Warning</Badge>
        <span>Service experiencing minor issues</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="error">Error</Badge>
        <span>Service is currently unavailable</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Maintenance</Badge>
        <span>Service is under maintenance</span>
      </div>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};
```

## Quality Checklist

Before publishing stories, ensure:

### ✅ Structure

- [ ] Proper hierarchical categorization in `title`
- [ ] Meaningful export names that describe purpose
- [ ] Comprehensive `argTypes` with descriptions
- [ ] Appropriate `parameters` configuration

### ✅ Coverage

- [ ] All major variants represented
- [ ] Interactive examples included
- [ ] Real-world usage scenarios
- [ ] Edge cases covered

### ✅ Testing

- [ ] Play functions for interactive stories
- [ ] Proper assertions in tests
- [ ] Accessibility considerations
- [ ] Error handling demonstrations

### ✅ Documentation

- [ ] Clear component and story descriptions
- [ ] Helpful parameter documentation
- [ ] Design system alignment
- [ ] Cross-component integration examples

## Best Practices Summary

1. **Be Descriptive** - Story names should immediately convey purpose
2. **Test Interactions** - Every interactive element should have play functions
3. **Show Real Usage** - Include practical, real-world scenarios
4. **Document Thoroughly** - Provide context and explanations
5. **Follow Conventions** - Stick to established patterns for consistency
6. **Consider Accessibility** - Include a11y examples and testing
7. **Integrate Components** - Show how components work together
8. **Update Regularly** - Keep stories current with component changes

## Component API Standards

All stories must reflect the current component API standards:

### Button Component

```typescript
// ✅ CORRECT: Current API
<Button color="error" variant="contained">Delete</Button>
<Button color="primary" variant="outlined">Edit</Button>
<Button color="secondary" variant="ghost">Cancel</Button>

// ❌ INCORRECT: Don't use default shadcn patterns
<Button variant="destructive">Delete</Button>  // Use color="error"
<Button variant="outline">Edit</Button>       // Use variant="outlined"
<Button variant="text">Cancel</Button>       // Use variant="ghost"
```

### All Components

- Use `error` instead of `destructive` for error states
- Follow our color system: `primary`, `secondary`, `error`, `warning`, `info`, `success`
- Use `outlined` instead of `outline` for consistency
- Don't default to standard shadcn patterns - use our customized API
