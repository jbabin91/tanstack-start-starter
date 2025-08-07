import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Navigation/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Navigation component for paginated content, allowing users to navigate between pages of data.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      description:
        'Additional CSS classes to apply to the pagination container.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicPagination: Story = {
  render: (args: any) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive href="#">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic pagination with previous, next, and numbered page links.',
      },
    },
  },
};

export const PaginationWithEllipsis: Story = {
  render: (args: any) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive href="#">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">8</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">9</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pagination with ellipsis to indicate skipped pages.',
      },
    },
  },
};

export const LargePagination: Story = {
  render: (args: any) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">24</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive href="#">
            25
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">26</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">100</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pagination for large datasets with ellipsis on both sides.',
      },
    },
  },
};

function FirstLastPagesComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (currentPage === 1) {
      // First page selected
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );
      if (totalPages > 1) {
        pages.push(
          <PaginationItem key={2}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(2);
              }}
            >
              2
            </PaginationLink>
          </PaginationItem>,
        );
      }
      if (totalPages > 2) {
        pages.push(
          <PaginationItem key={3}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(3);
              }}
            >
              3
            </PaginationLink>
          </PaginationItem>,
        );
      }
      if (totalPages > 4) {
        pages.push(
          <PaginationItem key="ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else if (currentPage === totalPages) {
      // Last page selected
      if (totalPages > 4) {
        pages.push(
          <PaginationItem key={1}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(1);
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>,
          <PaginationItem key="ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      pages.push(
        <PaginationItem key={totalPages - 2}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages - 2);
            }}
          >
            {totalPages - 2}
          </PaginationLink>
        </PaginationItem>,
        <PaginationItem key={totalPages - 1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages - 1);
            }}
          >
            {totalPages - 1}
          </PaginationLink>
        </PaginationItem>,
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    } else {
      // Middle page selected
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );
      if (currentPage > 3) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // Show current page and neighbors
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={i === currentPage}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Page {currentPage} of {totalPages}
        </p>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              style={{
                pointerEvents: currentPage === 1 ? 'none' : 'auto',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  handlePageChange(currentPage - 1);
                }
              }}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              href="#"
              style={{
                pointerEvents: currentPage === totalPages ? 'none' : 'auto',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  handlePageChange(currentPage + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export const FirstLastPages: Story = {
  render: () => <FirstLastPagesComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive pagination that handles first page, last page, and middle page states.',
      },
    },
  },
};

export const MinimalPagination: Story = {
  render: (args: any) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Minimal pagination with only previous and next buttons.',
      },
    },
  },
};

export const SinglePage: Story = {
  render: (args: any) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink isActive href="#">
            1
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pagination when there&apos;s only one page available.',
      },
    },
  },
};

export const InteractivePagination: Story = {
  render: (args: any) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious data-testid="prev-button" href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink data-testid="page-1" href="#">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive data-testid="page-2" href="#">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink data-testid="page-3" href="#">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis data-testid="ellipsis" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink data-testid="page-10" href="#">
            10
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext data-testid="next-button" href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Verify pagination elements are present
    const prevButton = canvas.getByTestId('prev-button');
    const nextButton = canvas.getByTestId('next-button');
    const page1 = canvas.getByTestId('page-1');
    const page2 = canvas.getByTestId('page-2');
    const page3 = canvas.getByTestId('page-3');
    const page10 = canvas.getByTestId('page-10');
    const ellipsis = canvas.getByTestId('ellipsis');

    // Verify all elements are in the document
    await expect(prevButton).toBeInTheDocument();
    await expect(nextButton).toBeInTheDocument();
    await expect(page1).toBeInTheDocument();
    await expect(page2).toBeInTheDocument();
    await expect(page3).toBeInTheDocument();
    await expect(page10).toBeInTheDocument();
    await expect(ellipsis).toBeInTheDocument();

    // Verify page 2 is active (using isActive prop which sets aria-current)
    await expect(page2).toHaveAttribute('aria-current', 'page');

    // Verify other pages don't have aria-current
    await expect(page1).not.toHaveAttribute('aria-current', 'page');
    await expect(page3).not.toHaveAttribute('aria-current', 'page');
    await expect(page10).not.toHaveAttribute('aria-current', 'page');

    // Check accessibility attributes
    await expect(prevButton).toHaveAttribute(
      'aria-label',
      'Go to previous page',
    );
    await expect(nextButton).toHaveAttribute('aria-label', 'Go to next page');
    await expect(ellipsis).toHaveAttribute('aria-hidden');

    // Verify links are clickable (they have href attributes)
    await expect(prevButton).toHaveAttribute('href', '#');
    await expect(nextButton).toHaveAttribute('href', '#');
    await expect(page1).toHaveAttribute('href', '#');
    await expect(page2).toHaveAttribute('href', '#');
    await expect(page3).toHaveAttribute('href', '#');
    await expect(page10).toHaveAttribute('href', '#');

    // Test clicking on a page link
    await userEvent.click(page3);
    // Note: Since these are just anchor links with href="#",
    // we can't test actual navigation behavior here
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive pagination with comprehensive testing of elements and accessibility.',
      },
    },
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-8">
      {/* No pages */}
      <div>
        <h3 className="text-muted-foreground mb-4 text-sm font-medium">
          Empty State:
        </h3>
        <Pagination aria-label="Empty state pagination example">
          <PaginationContent>
            <PaginationItem>
              <span className="text-muted-foreground px-3 py-2 text-sm">
                No pages to display
              </span>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Two pages only */}
      <div>
        <h3 className="text-muted-foreground mb-4 text-sm font-medium">
          Two Pages:
        </h3>
        <Pagination aria-label="Two pages pagination example">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                style={{ opacity: 0.5, pointerEvents: 'none' }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive href="#">
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Very large page numbers */}
      <div>
        <h3 className="text-muted-foreground mb-4 text-sm font-medium">
          Large Page Numbers:
        </h3>
        <Pagination aria-label="Large page numbers pagination example">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive href="#">
                9,999
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">10,000</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Disabled state */}
      <div>
        <h3 className="text-muted-foreground mb-4 text-sm font-medium">
          Disabled State:
        </h3>
        <Pagination aria-label="Disabled state pagination example">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                style={{
                  opacity: 0.5,
                  pointerEvents: 'none',
                  cursor: 'not-allowed',
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                isActive
                href="#"
                style={{
                  opacity: 0.7,
                  cursor: 'not-allowed',
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                style={{
                  opacity: 0.5,
                  pointerEvents: 'none',
                  cursor: 'not-allowed',
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Edge cases including empty state, two pages, large numbers, and disabled states.',
      },
    },
  },
};
