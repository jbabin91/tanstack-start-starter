import * as React from 'react';

import { Icons } from '@/components/icons';
import { type Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      data-slot="pagination"
      role="navigation"
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex flex-row items-center gap-1', className)}
      data-slot="pagination-content"
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({
  children,
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          size,
          variant: isActive ? 'outlined' : 'ghost',
        }),
        className,
      )}
      data-active={isActive}
      data-slot="pagination-link"
      {...props}
    >
      {children}
    </a>
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn('text-primary gap-1 px-2.5 sm:pl-2.5', className)}
      size="default"
      {...props}
    >
      <Icons.chevronLeft className="text-primary" />
      <span
        className="hidden sm:block"
        style={{ color: '#000000 !important', opacity: 1 }}
      >
        Previous
      </span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn('text-primary gap-1 px-2.5 sm:pr-2.5', className)}
      size="default"
      {...props}
    >
      <span
        className="hidden sm:block"
        style={{ color: '#000000 !important', opacity: 1 }}
      >
        Next
      </span>
      <Icons.chevronRight className="text-primary" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn('flex size-9 items-center justify-center', className)}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <Icons.moreHorizontal />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
