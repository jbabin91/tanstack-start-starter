import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/utils/cn';

const spinnerVariants = cva('flex-col items-center justify-center', {
  variants: {
    show: {
      false: 'hidden',
      true: 'flex',
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      large: 'size-12',
      medium: 'size-8',
      small: 'size-6',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

type SpinnerContentProps = {
  className?: string;
  children?: React.ReactNode;
} & VariantProps<typeof spinnerVariants> &
  VariantProps<typeof loaderVariants>;

export function Spinner({
  size,
  show,
  children,
  className,
}: SpinnerContentProps) {
  return (
    <span
      aria-live="polite"
      className={spinnerVariants({ show })}
      role="status"
    >
      <Icons.loader className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );
}
