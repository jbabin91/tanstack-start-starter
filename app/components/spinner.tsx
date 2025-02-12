import { cva, type VariantProps } from 'class-variance-authority';
import { LuLoaderCircle } from 'react-icons/lu';

import { cn } from '~/lib/utils';

const spinnerVariants = cva('flex-col items-center justify-center', {
  defaultVariants: {
    show: true,
  },
  variants: {
    show: {
      false: 'hidden',
      true: 'flex',
    },
  },
});

const loaderVariants = cva('animate-spin text-primary', {
  defaultVariants: {
    size: 'medium',
  },
  variants: {
    size: {
      large: 'size-12',
      medium: 'size-8',
      small: 'size-6',
    },
  },
});

type SpinnerContentProps = {
  className?: string;
  children?: React.ReactNode;
} & VariantProps<typeof spinnerVariants> &
  VariantProps<typeof loaderVariants>;

function Spinner({ size, show, children, className }: SpinnerContentProps) {
  return (
    <span className={spinnerVariants({ show })}>
      <LuLoaderCircle className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );
}
Spinner.displayName = 'Spinner';

export type { SpinnerContentProps };
export { loaderVariants, Spinner, spinnerVariants };
