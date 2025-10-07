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
} from '@/components/ui/pagination/pagination';

const meta: Meta<typeof Pagination> = {
  argTypes: {
    className: {
      control: 'text',
      description:
        'Additional CSS classes to apply to the pagination container.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
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
  title: 'UI/Navigation/Pagination',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicPagination: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Basic pagination with previous, next, and numbered page links.',
      },
    },
  },
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
};

export const PaginationWithEllipsis: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Pagination with ellipsis to indicate skipped pages.',
      },
    },
  },
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
};

export const LargePagination: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Pagination for large datasets with ellipsis on both sides.',
      },
    },
  },
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
};

export const MinimalPagination: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Minimal pagination with only previous and next buttons.',
      },
    },
  },
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
};

export const SinglePage: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Pagination when there&apos;s only one page available.',
      },
    },
  },
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
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.('previous');
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
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
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
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
      // Use semantic query - find link with text "3"
      const page3 = canvas.getByRole('link', { name: '3' });
      await userEvent.click(page3);
      expect(args.onPageChange).toHaveBeenCalledWith(3);
    });

    await step('Click next button', async () => {
      // Use semantic query - find link with "Go to next page" aria-label
      const nextButton = canvas.getByRole('link', { name: /go to next page/i });
      await userEvent.click(nextButton);
      expect(args.onPageChange).toHaveBeenCalledWith('next');
    });

    await step('Click previous button', async () => {
      // Use semantic query - find link with "Go to previous page" aria-label
      const prevButton = canvas.getByRole('link', {
        name: /go to previous page/i,
      });
      await userEvent.click(prevButton);
      expect(args.onPageChange).toHaveBeenCalledWith('previous');
    });

    await step('Click on page 10', async () => {
      // Use semantic query - find link with text "10"
      const page10 = canvas.getByRole('link', { name: '10' });
      await userEvent.click(page10);
      expect(args.onPageChange).toHaveBeenCalledWith(10);
    });

    await step('Verify ellipsis is not clickable', () => {
      // Use semantic query - find screen reader text for ellipsis
      const ellipsis = canvas.getByText('More pages');
      expect(ellipsis).toBeInTheDocument();
      // Ellipsis should not be clickable (no button role)
      expect(ellipsis.tagName).toBe('SPAN');
    });
  },
  render: (args) => <InteractivePaginationComponent {...args} />,
};

export const EdgeCases: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Edge cases including two pages and disabled states.',
      },
    },
  },
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
                  cursor: 'not-allowed',
                  opacity: 0.5,
                  pointerEvents: 'none',
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
                  cursor: 'not-allowed',
                  opacity: 0.5,
                  pointerEvents: 'none',
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  ),
};
