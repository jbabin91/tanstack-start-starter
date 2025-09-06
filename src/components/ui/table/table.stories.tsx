import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

const meta = {
  title: 'UI/Data Display/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A table component for displaying tabular data with proper semantic HTML structure. Supports headers, footers, captions, and responsive design. WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleInvoices = [
  {
    id: 'INV-001',
    customer: 'John Doe',
    email: 'john@example.com',
    status: 'Paid',
    amount: 250,
    date: '2024-01-15',
  },
  {
    id: 'INV-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    status: 'Pending',
    amount: 150,
    date: '2024-01-14',
  },
  {
    id: 'INV-003',
    customer: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'Failed',
    amount: 350,
    date: '2024-01-13',
  },
  {
    id: 'INV-004',
    customer: 'Alice Brown',
    email: 'alice@example.com',
    status: 'Paid',
    amount: 450,
    date: '2024-01-12',
  },
];

const sampleProducts = [
  { name: 'Laptop', category: 'Electronics', price: 999, stock: 45 },
  { name: 'Headphones', category: 'Electronics', price: 199, stock: 23 },
  { name: 'Coffee Mug', category: 'Home', price: 15, stock: 120 },
  { name: 'Desk Chair', category: 'Office', price: 299, stock: 8 },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleInvoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.id}</TableCell>
            <TableCell>{invoice.customer}</TableCell>
            <TableCell>
              <Badge
                variant={
                  invoice.status === 'Paid'
                    ? 'default'
                    : invoice.status === 'Pending'
                      ? 'secondary'
                      : 'error'
                }
              >
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check table structure
    const table = canvas.getByRole('table');
    expect(table).toBeVisible();

    // Check caption
    expect(canvas.getByText('A list of your recent invoices.')).toBeVisible();

    // Check column headers
    expect(canvas.getByRole('columnheader', { name: 'Invoice' })).toBeVisible();
    expect(
      canvas.getByRole('columnheader', { name: 'Customer' }),
    ).toBeVisible();
    expect(canvas.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    expect(canvas.getByRole('columnheader', { name: 'Amount' })).toBeVisible();

    // Check data rows
    const rows = canvas.getAllByRole('row');
    expect(rows).toHaveLength(5); // 1 header + 4 data rows

    // Check specific data
    expect(canvas.getByText('INV-001')).toBeVisible();
    expect(canvas.getByText('John Doe')).toBeVisible();
    expect(canvas.getByText('$250.00')).toBeVisible();
  },
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableCaption>Monthly sales summary</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleProducts.map((product) => (
          <TableRow key={product.name}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell className="text-right">${product.price}</TableCell>
            <TableCell className="text-right">{product.stock}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Value</TableCell>
          <TableCell className="text-right font-medium">
            $
            {sampleProducts
              .reduce((sum, product) => sum + product.price * product.stock, 0)
              .toLocaleString()}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check footer calculation
    expect(canvas.getByText('Total Value')).toBeVisible();
    expect(canvas.getByText('$110,467')).toBeVisible();

    // Check right-aligned headers and cells
    const priceHeader = canvas.getByRole('columnheader', { name: 'Price' });
    expect(priceHeader).toHaveClass('text-right');
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectAll = (checked: boolean) => {
      setSelectedIds(checked ? sampleInvoices.map((inv) => inv.id) : []);
    };

    const handleSelectItem = (id: string, checked: boolean) => {
      setSelectedIds((prev) =>
        checked ? [...prev, id] : prev.filter((item) => item !== id),
      );
    };

    return (
      <div className="space-y-4">
        <div className="text-muted-foreground text-sm">
          {selectedIds.length} of {sampleInvoices.length} selected
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Select all invoices"
                  checked={
                    selectedIds.length === sampleInvoices.length
                      ? true
                      : selectedIds.length > 0
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleInvoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                data-state={
                  selectedIds.includes(invoice.id) ? 'selected' : undefined
                }
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Select invoice ${invoice.id}`}
                    checked={selectedIds.includes(invoice.id)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(invoice.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === 'Paid'
                        ? 'default'
                        : invoice.status === 'Pending'
                          ? 'secondary'
                          : 'error'
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${invoice.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial selection count
    expect(canvas.getByText('0 of 4 selected')).toBeVisible();

    // Select individual item
    const firstCheckbox = canvas.getByLabelText('Select invoice INV-001');
    await userEvent.click(firstCheckbox);
    expect(canvas.getByText('1 of 4 selected')).toBeVisible();

    // Select all
    const selectAllCheckbox = canvas.getByLabelText('Select all invoices');
    await userEvent.click(selectAllCheckbox);
    expect(canvas.getByText('4 of 4 selected')).toBeVisible();

    // Deselect all
    await userEvent.click(selectAllCheckbox);
    expect(canvas.getByText('0 of 4 selected')).toBeVisible();
  },
};

export const WithActions: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-16">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleInvoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.customer}</TableCell>
            <TableCell>{invoice.email}</TableCell>
            <TableCell>
              <Badge
                variant={
                  invoice.status === 'Paid'
                    ? 'default'
                    : invoice.status === 'Pending'
                      ? 'secondary'
                      : 'error'
                }
              >
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              ${invoice.amount.toFixed(2)}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  aria-label={`Edit invoice ${invoice.id}`}
                  size="icon"
                  variant="ghost"
                >
                  <Icons.edit className="size-4" />
                </Button>
                <Button
                  aria-label={`Delete invoice ${invoice.id}`}
                  size="icon"
                  variant="ghost"
                >
                  <Icons.ban className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check action buttons exist
    const editButtons = canvas.getAllByLabelText(/Edit invoice/);
    const deleteButtons = canvas.getAllByLabelText(/Delete invoice/);

    expect(editButtons).toHaveLength(4);
    expect(deleteButtons).toHaveLength(4);

    // Test first edit button
    await userEvent.click(editButtons[0]);
    // Action would normally trigger some handler
  },
};

export const Sortable: Story = {
  render: () => {
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: string) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };

    const sortedInvoices = [...sampleInvoices].toSorted((a, b) => {
      if (!sortField) return 0;

      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    const SortButton = ({
      field,
      children,
    }: {
      field: string;
      children: React.ReactNode;
    }) => (
      <Button
        aria-label={`Sort by ${field}`}
        className="h-auto p-1 font-medium"
        size="sm"
        variant="ghost"
        onClick={() => handleSort(field)}
      >
        {children}
        {sortField === field && (
          <Icons.chevronDown
            className={`ml-1 size-3 transition-transform ${
              sortDirection === 'desc' ? 'rotate-180' : ''
            }`}
          />
        )}
      </Button>
    );

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="id">Invoice</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="customer">Customer</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status">Status</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton field="amount">Amount</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map((invoice: (typeof sampleInvoices)[0]) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    invoice.status === 'Paid'
                      ? 'default'
                      : invoice.status === 'Pending'
                        ? 'secondary'
                        : 'error'
                  }
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                ${invoice.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test sorting by customer
    const customerSort = canvas.getByRole('button', {
      name: 'Sort by customer',
    });
    await userEvent.click(customerSort);

    // Check that sort indicator appears
    const chevronIcon = customerSort.querySelector(
      '[data-slot="chevron-down"]',
    );
    expect(chevronIcon).toBeInTheDocument();

    // Test reverse sort
    await userEvent.click(customerSort);
    expect(chevronIcon).toHaveClass('rotate-180');
  },
};

export const EmptyState: Story = {
  render: () => (
    <Table>
      <TableCaption>No invoices found</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            className="text-muted-foreground py-8 text-center"
            colSpan={4}
          >
            <div className="flex flex-col items-center gap-2">
              <Icons.fileText className="size-8" />
              <div>No invoices found</div>
              <div className="text-xs">
                Create your first invoice to get started
              </div>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check empty state message
    expect(canvas.getByText('No invoices found')).toBeVisible();
    expect(
      canvas.getByText('Create your first invoice to get started'),
    ).toBeVisible();

    // Check that table structure is still valid
    const table = canvas.getByRole('table');
    expect(table).toBeVisible();
  },
};
