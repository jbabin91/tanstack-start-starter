# Component Audit Guidelines

This document provides guidelines for Claude Code agents when auditing UI components to prevent incorrect assumptions about outdated patterns.

## Pre-Audit Assessment Protocol

### 1. **Read Before Judging**

ALWAYS examine the actual component implementation before making recommendations. Never assume components use outdated patterns.

### 2. **Technology Stack Verification**

Check the project's current technology versions:

- **React Version**: Look for React 19 patterns in package.json
- **TailwindCSS Version**: Check for v4 syntax (CSS variables, @theme inline)
- **ShadCN Version**: Verify if using latest components with modern patterns

### 3. **Component Pattern Recognition**

Modern components may feature:

- Function components instead of forwardRef (when refs aren't needed)
- Built-in accessibility with ARIA attributes
- TailwindCSS v4 CSS variables
- Loading states and error handling
- Screen reader support

## React 19 Component Patterns

### Modern Function Components

```typescript
// ✅ Modern - Function component when refs aren't needed
function Button({ className, ...props }: ButtonProps) {
  return <button className={cn(styles, className)} {...props} />
}

// ✅ Also Modern - forwardRef when refs are needed
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    return <input ref={ref} {...props} />
  }
)
```

### Built-in Accessibility

```typescript
// ✅ Modern components include ARIA support
<button
  aria-busy={loading}
  aria-invalid={hasError}
  className="focus-visible:ring-[3px]"
>
  {loading && <Spinner />}
  {children}
</button>
```

## TailwindCSS v4 Recognition

### CSS Variables System

```css
/* ✅ Modern - @theme inline with CSS variables */
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
}

/* ❌ Old - Hardcoded colors */
.bg-blue-500 {
  background-color: #3b82f6;
}
```

### Modern Class Patterns

```typescript
// ✅ Modern TailwindCSS v4 patterns
className =
  'focus-visible:ring-[3px] aria-invalid:ring-destructive/20 field-sizing-content';

// ❌ Old patterns to avoid assuming
className = 'focus:ring-2 focus:ring-blue-500';
```

## Common Audit Mistakes to Avoid

### ❌ **Assuming Missing forwardRef**

**Wrong**: "This component needs forwardRef added"
**Right**: Check if the component actually needs ref forwarding for its use case

### ❌ **Assuming Missing ARIA**

**Wrong**: "This component lacks accessibility attributes"
**Right**: Verify existing ARIA attributes like `aria-busy`, `aria-invalid`, `role`

### ❌ **Assuming Old TailwindCSS**

**Wrong**: "Update to use CSS variables"
**Right**: Check if component already uses CSS variables via TailwindCSS v4

### ❌ **Assuming Missing Touch Targets**

**Wrong**: "Button needs larger touch targets"
**Right**: Check actual rendered sizes - modern components may already meet 44px minimum

### ❌ **Assuming Missing Loading States**

**Wrong**: "Component needs loading state"
**Right**: Check for existing loading props and ARIA support

## Correct Audit Process

### Step 1: Component Analysis

1. **Read the component file** completely
2. **Check imports** - What libraries and utilities are used?
3. **Analyze props** - What features are already built-in?
4. **Review styling** - What TailwindCSS patterns are present?

### Step 2: Feature Assessment

1. **TypeScript**: Proper typing with ComponentProps<'element'>?
2. **Accessibility**: ARIA attributes, screen reader support, keyboard navigation?
3. **Styling**: CSS variables, focus management, responsive design?
4. **Functionality**: Loading states, error handling, validation feedback?

### Step 3: Context Evaluation

1. **Project Integration**: How does this fit with the overall architecture?
2. **Consistency**: Does it match other components in the project?
3. **Modern Standards**: Is it using current best practices for the tech stack?

## Positive Audit Examples

### ✅ **Recognizing Excellence**

```typescript
// This component demonstrates modern excellence:
function Button({ loading, className, children, ...props }) {
  return (
    <button
      aria-busy={loading}
      className={cn(
        'focus-visible:ring-[3px] aria-invalid:ring-destructive/20',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <Spinner className="sr-only">Loading...</Spinner>}
      {children}
    </button>
  )
}
```

**Correct Assessment**: "This component already implements modern React 19 patterns with proper accessibility, TailwindCSS v4 styling, and built-in loading states. No critical updates needed."

### ✅ **Constructive Improvements**

When components are already modern, focus on:

- **Enhancement opportunities** (additional features)
- **Performance optimizations** (if measurable benefits)
- **Developer experience** (better TypeScript types)
- **Edge case handling** (error scenarios)

## Documentation Standards

When creating audit reports:

1. **Lead with positives** - Acknowledge what's working well
2. **Be specific** - Reference actual code patterns and line numbers
3. **Provide context** - Explain why something is or isn't needed
4. **Focus on impact** - Prioritize changes that affect user experience
5. **Respect existing patterns** - Don't suggest changes just to match old tutorials

## Agent Training Checklist

Agents should verify they can:

- [ ] Identify React 19 function component patterns
- [ ] Recognize TailwindCSS v4 CSS variable usage
- [ ] Spot built-in accessibility features (ARIA, screen reader support)
- [ ] Understand when forwardRef is and isn't needed
- [ ] Assess touch target compliance without assuming violations
- [ ] Evaluate loading states and error handling
- [ ] Distinguish between enhancement opportunities and critical fixes

This ensures agents provide valuable, accurate feedback rather than outdated recommendations based on older patterns.
