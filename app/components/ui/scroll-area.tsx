import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';

import { cn } from '@/lib/utils';

function ScrollArea({ children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaRoot {...props}>
      <ScrollViewport>
        {children}
        <ScrollBar />
        <ScrollCorner />
      </ScrollViewport>
    </ScrollAreaRoot>
  );
}

function ScrollAreaRoot({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root className={cn('relative overflow-hidden', className)} {...props} />
  );
}

function ScrollViewport({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>) {
  return (
    <ScrollAreaPrimitive.Viewport
      className={cn('size-full rounded-[inherit]', className)}
      {...props}
    />
  );
}

function ScrollBar({
  orientation = 'vertical',
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        'flex touch-none select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-px',
        className,
      )}
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

const ScrollCorner = ScrollAreaPrimitive.Corner;

export { ScrollArea, ScrollAreaRoot, ScrollBar, ScrollCorner, ScrollViewport };
