import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:bg-muted disabled:text-black/50 disabled:border-muted disabled:opacity-60 disabled:cursor-not-allowed dark:disabled:bg-muted-foreground/70 dark:disabled:text-white/90 dark:disabled:border-muted-foreground/80 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error",
  {
    variants: {
      color: {
        // Consistent semantic text colors across all variants (except contained which overrides)
        primary: 'text-primary focus-visible:ring-ring/50',
        secondary: 'text-secondary-foreground focus-visible:ring-ring/50',
        error:
          'text-error-text focus-visible:ring-error/20 dark:focus-visible:ring-error/40',
        success:
          'text-success-text focus-visible:ring-success/20 dark:focus-visible:ring-success/40',
        warning:
          'text-warning-text focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40',
        info: 'text-info-text focus-visible:ring-info/20 dark:focus-visible:ring-info/40',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
      },
      variant: {
        // Contained gets full background styling
        contained: 'border shadow-xs',
        // Ghost is transparent with semantic hover backgrounds
        ghost: 'bg-transparent shadow-none',
        // Outlined has borders and background
        outlined:
          'border bg-background shadow-xs dark:bg-input/30 dark:border-input',
        // Link is transparent with underline that inherits text color
        link: 'bg-transparent shadow-none underline-offset-4 hover:underline decoration-current disabled:bg-transparent disabled:no-underline',
      },
    },
    compoundVariants: [
      // Contained variant styling - override base colors with backgrounds
      {
        variant: 'contained',
        color: 'primary',
        class: 'bg-primary text-primary-foreground hover:bg-primary/70',
      },
      {
        variant: 'contained',
        color: 'secondary',
        class: 'bg-secondary text-secondary-foreground hover:bg-secondary/15',
      },
      {
        variant: 'contained',
        color: 'error',
        class:
          'border-error/20 bg-error/10 hover:bg-error/15 dark:bg-error/10 dark:hover:bg-error/30',
      },
      {
        variant: 'contained',
        color: 'success',
        class:
          'border-success/20 bg-success/10 hover:bg-success/15 dark:bg-success/10 dark:hover:bg-success/30',
      },
      {
        variant: 'contained',
        color: 'warning',
        class:
          'border-warning/20 bg-warning/10 hover:bg-warning/15 dark:bg-warning/10 dark:hover:bg-warning/30',
      },
      {
        variant: 'contained',
        color: 'info',
        class:
          'border-info/20 bg-info/10 hover:bg-info/15 dark:bg-info/10 dark:hover:bg-info/30',
      },

      // Ghost buttons with improved dark mode visibility
      {
        variant: 'ghost',
        color: 'primary',
        class:
          'hover:bg-primary/10 dark:text-foreground dark:hover:bg-primary/20',
      },
      {
        variant: 'ghost',
        color: 'secondary',
        class: 'hover:bg-muted dark:text-muted-foreground',
      },
      {
        variant: 'ghost',
        color: 'error',
        class: 'hover:bg-error/10 dark:hover:bg-error/20',
      },
      {
        variant: 'ghost',
        color: 'success',
        class: 'hover:bg-success/10 dark:hover:bg-success/20',
      },
      {
        variant: 'ghost',
        color: 'warning',
        class: 'hover:bg-warning/10 dark:hover:bg-warning/20',
      },
      {
        variant: 'ghost',
        color: 'info',
        class: 'hover:bg-info/10 dark:hover:bg-info/20',
      },

      {
        variant: 'outlined',
        color: 'primary',
        class:
          'border-primary/20 hover:bg-primary/10 dark:border-primary/30 dark:hover:bg-primary/20',
      },
      {
        variant: 'outlined',
        color: 'secondary',
        class:
          'border-border hover:bg-muted/50 dark:hover:bg-muted-foreground/20',
      },
      {
        variant: 'outlined',
        color: 'error',
        class:
          'border-error/20 hover:bg-error/10 dark:border-error/30 dark:hover:bg-error/20',
      },
      {
        variant: 'outlined',
        color: 'success',
        class:
          'border-success/20 hover:bg-success/10 dark:border-success/30 dark:hover:bg-success/20',
      },
      {
        variant: 'outlined',
        color: 'warning',
        class:
          'border-warning/20 hover:bg-warning/10 dark:border-warning/30 dark:hover:bg-warning/20',
      },
      {
        variant: 'outlined',
        color: 'info',
        class:
          'border-info/20 hover:bg-info/10 dark:border-info/30 dark:hover:bg-info/20',
      },
    ],
    defaultVariants: {
      color: 'primary',
      size: 'default',
      variant: 'contained',
    },
  },
);

/**
 * Button component with support for loading state.
 *
 * Props:
 * - loading?: boolean — If true, shows a spinner and disables the button.
 * - loadingText?: string — Optional text to show instead of children when loading.
 * - All regular button props, plus variant, size, color, render.
 */
type ButtonProps = {
  render?: useRender.RenderProp;
  loading?: boolean;
  loadingText?: string;
} & React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant,
  size,
  color,
  loading = false,
  loadingText,
  disabled,
  children,
  type = 'button',
  render,
  ...props
}: ButtonProps) {
  const buttonContent = (
    <>
      {loading && (
        <>
          <Spinner className="mr-2 text-current" size="small" />
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
    </>
  );

  return useRender({
    render: render ?? <button type={type} />,
    props: {
      'data-slot': 'button',
      'aria-busy': loading ?? undefined,
      'aria-disabled': loading ?? disabled ?? undefined,
      disabled: loading || disabled,
      className: cn(buttonVariants({ className, color, size, variant })),
      type,
      ...props,
      children: buttonContent,
    },
  });
}

export { Button, buttonVariants };
