import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        info: 'border-info/50 text-info dark:border-info [&>svg]:text-info',
        success:
          'border-success/50 text-success dark:border-success [&>svg]:text-success',
        warning:
          'border-warning/50 text-warning dark:border-warning [&>svg]:text-warning',
      },
    },
  },
);

type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

function Alert({ className, variant, ...properties }: AlertProps) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...properties}
    />
  );
}

type AlertTitleProps = HTMLAttributes<HTMLDivElement>;

function AlertTitle({ className, ...properties }: AlertTitleProps) {
  return (
    <div
      className={cn('mb-1 leading-none font-medium tracking-tight', className)}
      {...properties}
    />
  );
}

type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

function AlertDescription({ className, ...properties }: AlertDescriptionProps) {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...properties}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
