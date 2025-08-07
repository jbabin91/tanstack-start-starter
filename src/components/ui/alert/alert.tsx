import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        error:
          'border-error-text/30 text-error-text bg-error-bg [&>svg]:text-error-text/90 *:data-[slot=alert-description]:text-error-text',
        info: 'border-info-text/30 text-info-text bg-info-bg [&>svg]:text-info-text/90 *:data-[slot=alert-description]:text-info-text',
        success:
          'border-success-text/30 text-success-text bg-success-bg [&>svg]:text-success-text/90 *:data-[slot=alert-description]:text-success-text',
        warning:
          'border-warning-text/30 text-warning-text bg-warning-bg [&>svg]:text-warning-text/90 *:data-[slot=alert-description]:text-warning-text',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}
function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className,
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
