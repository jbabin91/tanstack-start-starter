import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error",
  {
    variants: {
      color: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        error:
          'border-error/20 bg-error/10 text-error-text hover:bg-error/15 focus-visible:ring-error/20 dark:focus-visible:ring-error/40 dark:bg-error/10 dark:text-error-text',
        info: 'border-info/20 bg-info/10 text-info-text hover:bg-info/15 focus-visible:ring-info/20 dark:focus-visible:ring-info/40 dark:bg-info/10 dark:text-info-text',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success:
          'border-success/20 bg-success/10 text-success-text hover:bg-success/15 focus-visible:ring-success/20 dark:focus-visible:ring-success/40 dark:bg-success/10 dark:text-success-text',
        warning:
          'border-warning/20 bg-warning/10 text-warning-text hover:bg-warning/15 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40 dark:bg-warning/10 dark:text-warning-text',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
      },
      variant: {
        contained: 'border shadow-xs',
        text: 'bg-transparent shadow-none text-primary hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        outlined:
          'border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        link: 'bg-transparent shadow-none text-foreground underline-offset-4 hover:underline',
      },
    },
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
