import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        error:
          'border-error/20 bg-error/10 text-error-text [a&]:hover:bg-error/15 [a&]:hover:border-error/30 focus-visible:ring-error/20 dark:focus-visible:ring-error/40 dark:bg-error/10 dark:border-error/30 dark:text-error-text',
        'error-solid':
          'border-transparent bg-error-emphasis text-error-emphasis-foreground [a&]:hover:bg-error-emphasis/90 focus-visible:ring-error-emphasis/20 dark:focus-visible:ring-error-emphasis/40',
        info: 'border-info/20 bg-info/10 text-info-text [a&]:hover:bg-info/15 [a&]:hover:border-info/30 focus-visible:ring-info/20 dark:focus-visible:ring-info/40 dark:bg-info/10 dark:border-info/30 dark:text-info-text',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        success:
          'border-success/20 bg-success/10 text-success-text [a&]:hover:bg-success/15 [a&]:hover:border-success/30 focus-visible:ring-success/20 dark:focus-visible:ring-success/40 dark:bg-success/10 dark:border-success/30 dark:text-success-text',
        'success-solid':
          'border-transparent bg-success-emphasis text-success-emphasis-foreground [a&]:hover:bg-success-emphasis/90 focus-visible:ring-success-emphasis/20 dark:focus-visible:ring-success-emphasis/40',
        warning:
          'border-warning/20 bg-warning/10 text-warning-text [a&]:hover:bg-warning/15 [a&]:hover:border-warning/30 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40 dark:bg-warning/10 dark:border-warning/30 dark:text-warning-text',
        'warning-solid':
          'border-transparent bg-warning-emphasis text-warning-emphasis-foreground [a&]:hover:bg-warning-emphasis/90 focus-visible:ring-warning-emphasis/20 dark:focus-visible:ring-warning-emphasis/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
