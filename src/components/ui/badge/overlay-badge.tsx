import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

function calculateBadgeOffset(
  variant: 'dot' | 'count' | 'standard',
  overlap: 'rectangular' | 'circular',
  spacing: 'tight' | 'normal' | 'loose',
): { horizontal: string; vertical: string } {
  const offsets = {
    count: {
      rectangular: {
        loose: { horizontal: '0.875rem', vertical: '0.875rem' },
        normal: { horizontal: '0.625rem', vertical: '0.625rem' },
        tight: { horizontal: '0.375rem', vertical: '0.375rem' },
      },
      circular: {
        loose: { horizontal: '0.375rem', vertical: '0.375rem' },
        normal: { horizontal: '0.25rem', vertical: '0.25rem' },
        tight: { horizontal: '0.25rem', vertical: '0.25rem' },
      },
    },
    dot: {
      rectangular: {
        loose: { horizontal: '0.5rem', vertical: '0.5rem' },
        normal: { horizontal: '0.375rem', vertical: '0.375rem' },
        tight: { horizontal: '0.25rem', vertical: '0.25rem' },
      },
      circular: {
        loose: { horizontal: '0.375rem', vertical: '0.375rem' },
        normal: { horizontal: '0.125rem', vertical: '0.125rem' },
        tight: { horizontal: '0.03125rem', vertical: '0.03125rem' },
      },
    },
    standard: {
      rectangular: {
        loose: { horizontal: '1.5rem', vertical: '1.5rem' },
        normal: { horizontal: '1.25rem', vertical: '1.25rem' },
        tight: { horizontal: '0.875rem', vertical: '0.875rem' },
      },
      circular: {
        loose: { horizontal: '1rem', vertical: '0.6875rem' },
        normal: { horizontal: '0.875rem', vertical: '0.5625rem' },
        tight: { horizontal: '0.75rem', vertical: '0.4375rem' },
      },
    },
  };

  return offsets[variant][overlap][spacing];
}

function useOverlayBadge({
  badgeContent,
  invisible: invisibleProp = false,
  max = 99,
  showZero = false,
}: {
  badgeContent?: React.ReactNode;
  invisible?: boolean;
  max?: number;
  showZero?: boolean;
}) {
  const prevProps = React.useRef({
    badgeContent,
    max,
  });

  let invisible = invisibleProp;

  if (invisibleProp === false && badgeContent === 0 && !showZero) {
    invisible = true;
  }

  const { badgeContent: currentContent, max: currentMax } = invisible
    ? prevProps.current
    : { badgeContent, max };

  // Update ref in effect to avoid updating during render
  React.useEffect(() => {
    if (!invisible) {
      prevProps.current = { badgeContent, max };
    }
  }, [invisible, badgeContent, max]);

  const displayValue: React.ReactNode =
    currentContent && Number(currentContent) > currentMax
      ? `${currentMax}+`
      : currentContent;

  return {
    invisible,
    displayValue,
  };
}

const overlayBadgeVariants = cva(
  'absolute z-10 flex items-center justify-center text-xs font-medium transition-all duration-200 ease-in-out',
  {
    compoundVariants: [
      {
        class: 'bg-background border-2 border-muted-foreground',
        color: 'offline',
        variant: 'dot',
      },
    ],
    defaultVariants: {
      anchorOrigin: 'top-right',
      color: 'error',
      invisible: false,
      overlap: 'rectangular',
      spacing: 'tight',
      variant: 'count',
    },
    variants: {
      anchorOrigin: {
        'bottom-left':
          '-bottom-[var(--badge-offset-vertical)] -start-[var(--badge-offset-horizontal)] origin-bottom-left',
        'bottom-right':
          '-bottom-[var(--badge-offset-vertical)] -end-[var(--badge-offset-horizontal)] origin-bottom-right',
        'top-left':
          '-top-[var(--badge-offset-vertical)] -start-[var(--badge-offset-horizontal)] origin-top-left',
        'top-right':
          '-top-[var(--badge-offset-vertical)] -end-[var(--badge-offset-horizontal)] origin-top-right',
      },
      color: {
        away: 'bg-yellow-500 text-white',
        busy: 'bg-red-500 text-white',
        error: 'bg-error text-error-foreground',
        info: 'bg-info text-info-foreground',
        offline: 'bg-gray-500 text-white',
        online: 'bg-green-500 text-white',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
      },
      invisible: {
        true: 'scale-0',
        false: 'scale-100',
      },
      overlap: {
        rectangular: '',
        circular: '',
      },
      spacing: {
        loose: '',
        normal: '',
        tight: '',
      },
      variant: {
        count:
          'min-h-4 min-w-4 px-1 rounded-full ring-2 ring-background text-xs leading-none',
        dot: 'size-2.5 p-0 rounded-full ring-2 ring-background',
        standard:
          'inline-block h-5 px-1.5 py-0.5 rounded-sm ring-1 ring-background text-xs leading-tight max-w-14 truncate text-center',
      },
    },
  },
);

type OverlayBadgeProps = {
  children: React.ReactNode;
  badgeContent?: React.ReactNode;
  invisible?: boolean;
  showZero?: boolean;
  max?: number;
  variant?: 'dot' | 'count' | 'standard';
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | 'online'
    | 'away'
    | 'offline'
    | 'busy';
  anchorOrigin?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  overlap?: 'rectangular' | 'circular';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
  badgeClassName?: string;
  srLabel?: string;
} & VariantProps<typeof overlayBadgeVariants>;

function OverlayBadge({
  children,
  badgeContent,
  invisible = false,
  showZero = false,
  max = 99,
  variant = 'count',
  color = 'error',
  anchorOrigin = 'top-right',
  overlap = 'rectangular',
  spacing = 'tight',
  className,
  badgeClassName,
  srLabel,
}: OverlayBadgeProps) {
  const { invisible: badgeInvisible, displayValue } = useOverlayBadge({
    badgeContent,
    invisible,
    max,
    showZero,
  });

  const displayBadge = React.useMemo(() => {
    if (badgeInvisible) return false;
    if (variant === 'dot') return true;
    return (
      displayValue !== undefined && displayValue !== null && displayValue !== ''
    );
  }, [badgeInvisible, variant, displayValue]);

  const badgeDisplayContent = variant === 'dot' ? null : displayValue;

  const shouldShowTooltip = React.useMemo(() => {
    if (variant !== 'standard' || !badgeDisplayContent) return false;
    if (typeof badgeDisplayContent !== 'string') return false;
    return badgeDisplayContent.length > 6;
  }, [variant, badgeDisplayContent]);

  const fullContent =
    typeof badgeDisplayContent === 'string' ? badgeDisplayContent : '';

  const badgeOffsets = React.useMemo(
    () => calculateBadgeOffset(variant, overlap, spacing),
    [variant, overlap, spacing],
  );

  return (
    <div className={cn('relative inline-flex', className)}>
      {children}
      {displayBadge && (
        <span
          aria-label={shouldShowTooltip ? fullContent : undefined}
          className={cn(
            overlayBadgeVariants({
              anchorOrigin,
              color,
              invisible: badgeInvisible,
              overlap,
              spacing,
              variant,
            }),
            badgeClassName,
          )}
          data-slot="overlay-badge"
          style={
            {
              '--badge-offset-horizontal': badgeOffsets.horizontal,
              '--badge-offset-vertical': badgeOffsets.vertical,
            } as React.CSSProperties
          }
          title={shouldShowTooltip ? fullContent : undefined}
        >
          {badgeDisplayContent}
          {srLabel && <span className="sr-only">{srLabel}</span>}
        </span>
      )}
    </div>
  );
}

export { OverlayBadge, overlayBadgeVariants };
export type { OverlayBadgeProps };
