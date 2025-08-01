# Component Audit Guidelines for Agents

## Critical Pre-Audit Protocol

### 1. READ BEFORE JUDGING

- **ALWAYS examine actual component implementation** before recommendations
- **NEVER assume components use outdated patterns**
- Check the component file completely before suggesting changes

### 2. Technology Stack Verification

Current project uses:

- **React 19** - Function components, modern patterns
- **TailwindCSS v4** - CSS variables, @theme inline syntax
- **ShadCN UI** - Latest components with modern accessibility

### 3. Modern Component Pattern Recognition

Our components feature:

- Function components (forwardRef only when refs needed)
- Built-in ARIA attributes and accessibility
- TailwindCSS v4 CSS variables
- Loading states and error handling
- Screen reader support

## React 19 Component Patterns

### ✅ Modern Function Components

```typescript
// Correct - Function component when refs aren't needed
function Button({ className, ...props }: ButtonProps) {
  return <button className={cn(styles, className)} {...props} />
}

// Also correct - forwardRef when refs ARE needed
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    return <input ref={ref} {...props} />
  }
)
```

## Common Agent Audit Mistakes to AVOID

### ❌ Assuming Missing forwardRef

**WRONG**: "This component needs forwardRef added"
**RIGHT**: Check if component actually needs ref forwarding for its use case

### ❌ Assuming Missing ARIA

**WRONG**: "This component lacks accessibility"  
**RIGHT**: Verify existing ARIA attributes (aria-busy, aria-invalid, role)

### ❌ Assuming Old TailwindCSS

**WRONG**: "Update to use CSS variables"
**RIGHT**: Check if component already uses CSS variables via TailwindCSS v4

### ❌ Assuming Missing Features

**WRONG**: "Component needs loading state/touch targets"
**RIGHT**: Check for existing props and ARIA support first

## Correct Audit Process

### Step 1: Component Analysis

1. Read component file completely
2. Check imports and utilities used
3. Analyze props and built-in features
4. Review styling patterns

### Step 2: Feature Assessment

1. TypeScript: Proper typing with ComponentProps<'element'>?
2. Accessibility: ARIA attributes, keyboard navigation?
3. Styling: CSS variables, focus management?
4. Functionality: Loading states, error handling?

### Step 3: Positive Recognition

Lead audit reports with what's working well, be specific about patterns found

## Agent Training Checklist

Agents must verify they can:

- [ ] Identify React 19 function component patterns
- [ ] Recognize TailwindCSS v4 CSS variable usage
- [ ] Spot built-in accessibility features
- [ ] Understand when forwardRef is/isn't needed
- [ ] Distinguish enhancement opportunities from critical fixes

This ensures agents provide valuable, accurate feedback rather than outdated recommendations.
