import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

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
  render: (args) => (
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
  render: (args) => (
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
  render: (args) => (
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

export const MinimalPagination: Story = {
  render: (args) => (
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
  render: (args) => (
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

// Interactive pagination component with mock handlers
function InteractivePaginationComponent({
  onPageChange,
}: {
  onPageChange?: (page: number | string) => void;
}) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            data-testid="prev-button"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.('previous');
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            data-testid="page-1"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            isActive
            data-testid="page-2"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.(2);
            }}
          >
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            data-testid="page-3"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.(3);
            }}
          >
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis data-testid="ellipsis" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            data-testid="page-10"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.(10);
            }}
          >
            10
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            data-testid="next-button"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.('next');
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export const InteractivePagination: StoryObj<
  typeof InteractivePaginationComponent
> = {
  args: {
    onPageChange: fn(),
  },
  render: (args) => <InteractivePaginationComponent {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive pagination with test IDs for accessibility and interaction testing.',
      },
    },
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click on page 3', async () => {
      const page3 = canvas.getByTestId('page-3');
      await userEvent.click(page3);
      expect(args.onPageChange).toHaveBeenCalledWith(3);
    });

    await step('Click next button', async () => {
      const nextButton = canvas.getByTestId('next-button');
      await userEvent.click(nextButton);
      expect(args.onPageChange).toHaveBeenCalledWith('next');
    });

    await step('Click previous button', async () => {
      const prevButton = canvas.getByTestId('prev-button');
      await userEvent.click(prevButton);
      expect(args.onPageChange).toHaveBeenCalledWith('previous');
    });

    await step('Click on page 10', async () => {
      const page10 = canvas.getByTestId('page-10');
      await userEvent.click(page10);
      expect(args.onPageChange).toHaveBeenCalledWith(10);
    });

    await step('Verify ellipsis is not clickable', () => {
      const ellipsis = canvas.getByTestId('ellipsis');
      expect(ellipsis).toBeInTheDocument();
      // Ellipsis should not be clickable (no onClick handler)
      expect(ellipsis.tagName).toBe('SPAN');
    });
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-8">
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
        story: 'Edge cases including two pages and disabled states.',
      },
    },
  },
};
