import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { LuChevronRight, LuMoreHorizontal } from 'react-icons/lu';

import { cn } from '@/lib/utils.ts';

function Breadcrumb({ children, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav aria-label="breadcrumb" {...props}>
      {children}
    </nav>
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      className={cn(
        'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'a';

  return <Comp className={cn('transition-colors hover:text-foreground', className)} {...props} />;
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-current="page"
      aria-disabled="true"
      className={cn('font-normal text-foreground', className)}
      role="link"
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      role="presentation"
      {...props}
    >
      {children ?? <LuChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      role="presentation"
      {...props}
    >
      <LuMoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
