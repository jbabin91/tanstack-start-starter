import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      color: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        info: 'bg-info text-info-foreground hover:bg-info/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
      },
      variant: {
        default: 'shadow-xs',
        destructive:
          'shadow-xs focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'underline-offset-4 hover:underline',
        outline:
          'border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'shadow-xs',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'default',
      variant: 'default',
    },
  },
);

/**
 * Button component with support for loading state.
 *
 * Props:
 * - loading?: boolean — If true, shows a spinner and disables the button.
 * - loadingText?: string — Optional text to show instead of children when loading.
 * - All regular button props, plus variant, size, color, asChild.
 */
function Button({
  className,
  variant,
  size,
  color,
  asChild = false,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    loadingText?: string;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      aria-busy={loading ?? undefined}
      aria-disabled={loading ?? disabled ?? undefined}
      className={cn(buttonVariants({ className, color, size, variant }))}
      data-slot="button"
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <>
          <Spinner className="text-primary-foreground mr-2" size="small" />
          {loadingText ? (
            <>
              {loadingText}
              <span className="sr-only">Loading…</span>
            </>
          ) : (
            <>
              {children}
              <span className="sr-only">Loading…</span>
            </>
          )}
        </>
      )}
      {!loading && children}
    </Comp>
  );
}

export { Button, buttonVariants };
