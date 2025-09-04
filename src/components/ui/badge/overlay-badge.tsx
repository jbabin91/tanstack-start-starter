import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

// Dynamic badge offset calculation - eliminates compound variants
function calculateBadgeOffset(
  variant: 'dot' | 'count' | 'standard',
  overlap: 'rectangular' | 'circular',
  spacing: 'tight' | 'normal' | 'loose',
): { horizontal: string; vertical: string } {
  // Define offset values for each combination with separate horizontal/vertical control
  const offsets = {
    dot: {
      rectangular: {
        tight: { horizontal: '0.25rem', vertical: '0.25rem' },
        normal: { horizontal: '0.375rem', vertical: '0.375rem' },
        loose: { horizontal: '0.5rem', vertical: '0.5rem' },
      },
      circular: {
        tight: { horizontal: '0.03125rem', vertical: '0.03125rem' },
        normal: { horizontal: '0.125rem', vertical: '0.125rem' },
        loose: { horizontal: '0.375rem', vertical: '0.375rem' },
      },
    },
    count: {
      rectangular: {
        tight: { horizontal: '0.375rem', vertical: '0.375rem' },
        normal: { horizontal: '0.625rem', vertical: '0.625rem' },
        loose: { horizontal: '0.875rem', vertical: '0.875rem' },
      },
      circular: {
        tight: { horizontal: '0.25rem', vertical: '0.25rem' },
        normal: { horizontal: '0.25rem', vertical: '0.25rem' },
        loose: { horizontal: '0.375rem', vertical: '0.375rem' },
      },
    },
    standard: {
      rectangular: {
        tight: { horizontal: '0.875rem', vertical: '0.875rem' },
        normal: { horizontal: '1.25rem', vertical: '1.25rem' },
        loose: { horizontal: '1.5rem', vertical: '1.5rem' },
      },
      circular: {
        tight: { horizontal: '0.75rem', vertical: '0.4375rem' },
        normal: { horizontal: '0.875rem', vertical: '0.5625rem' },
        loose: { horizontal: '1rem', vertical: '0.6875rem' },
      },
    },
  };

  return offsets[variant][overlap][spacing];
}

// Custom hook for badge logic (inspired by MUI's useBadge)
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
  // Previous props to maintain state during transitions
  const prevProps = React.useRef({
    badgeContent,
    max,
  });

  let invisible = invisibleProp;

  // Hide badge when content is 0 and showZero is false
  if (invisibleProp === false && badgeContent === 0 && !showZero) {
    invisible = true;
  }

  // Use current props when visible, previous when invisible (for animations)
  const { badgeContent: currentContent, max: currentMax } = invisible
    ? prevProps.current
    : { badgeContent, max };

  // Update previous props when not invisible
  if (!invisible) {
    prevProps.current = { badgeContent, max };
  }

  // Calculate display value
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
    variants: {
      variant: {
        dot: 'size-2.5 p-0 rounded-full ring-2 ring-background',
        count:
          'min-h-4 min-w-4 px-1 rounded-full ring-2 ring-background text-xs leading-none',
        standard:
          'inline-block h-5 px-1.5 py-0.5 rounded-sm ring-1 ring-background text-xs leading-tight max-w-14 truncate text-center',
      },
      color: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        error: 'bg-error text-error-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        info: 'bg-info text-info-foreground',
        online: 'bg-green-500 text-white',
        away: 'bg-yellow-500 text-white',
        offline: 'bg-gray-500 text-white',
        busy: 'bg-red-500 text-white',
      },
      anchorOrigin: {
        'top-right':
          '-top-[var(--badge-offset-vertical)] -end-[var(--badge-offset-horizontal)] origin-top-right',
        'top-left':
          '-top-[var(--badge-offset-vertical)] -start-[var(--badge-offset-horizontal)] origin-top-left',
        'bottom-right':
          '-bottom-[var(--badge-offset-vertical)] -end-[var(--badge-offset-horizontal)] origin-bottom-right',
        'bottom-left':
          '-bottom-[var(--badge-offset-vertical)] -start-[var(--badge-offset-horizontal)] origin-bottom-left',
      },
      overlap: {
        rectangular: '',
        circular: '',
      },
      invisible: {
        true: 'scale-0',
        false: 'scale-100',
      },
      spacing: {
        tight: '', // Default positioning
        normal: '', // Slightly more spacing
        loose: '', // More spacing for better separation
      },
    },
    compoundVariants: [
      // Special offline styling (hollow dot)
      {
        variant: 'dot',
        color: 'offline',
        class: 'bg-background border-2 border-muted-foreground',
      },
    ],
    defaultVariants: {
      variant: 'count',
      color: 'error',
      anchorOrigin: 'top-right',
      overlap: 'rectangular',
      invisible: false,
      spacing: 'tight',
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
  // Accessibility
  srLabel?: string; // Screen reader label for the badge
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
  // Use the new hook for badge logic
  const { invisible: badgeInvisible, displayValue } = useOverlayBadge({
    badgeContent,
    invisible,
    max,
    showZero,
  });

  // Determine if badge should be displayed
  const displayBadge = React.useMemo(() => {
    if (badgeInvisible) return false;
    if (variant === 'dot') return true;
    return (
      displayValue !== undefined && displayValue !== null && displayValue !== ''
    );
  }, [badgeInvisible, variant, displayValue]);

  // For dot variant, don't show content
  const badgeDisplayContent = variant === 'dot' ? null : displayValue;

  // Check if content might be truncated (for tooltip)
  const shouldShowTooltip = React.useMemo(() => {
    if (variant !== 'standard' || !badgeDisplayContent) return false;
    // Only show tooltip for string content that might truncate
    if (typeof badgeDisplayContent !== 'string') return false;
    // Show tooltip for content longer than 6 characters (approximately when truncation occurs)
    return badgeDisplayContent.length > 6;
  }, [variant, badgeDisplayContent]);

  const fullContent =
    typeof badgeDisplayContent === 'string' ? badgeDisplayContent : '';

  // Calculate dynamic badge offsets (separate horizontal/vertical)
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
              variant,
              color,
              anchorOrigin,
              overlap,
              spacing,
              invisible: badgeInvisible,
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
