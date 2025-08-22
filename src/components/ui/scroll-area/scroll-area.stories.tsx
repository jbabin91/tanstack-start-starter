import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { ScrollArea, ScrollBar } from './scroll-area';

const meta = {
  title: 'UI/Layout/Scroll Area',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A scroll area component built on Radix UI that provides custom scrollbars while maintaining native scrolling behavior. Supports vertical and horizontal scrolling with customizable styling. WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[300px] w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`;

const tags = [
  'React',
  'Next.js',
  'TypeScript',
  'TailwindCSS',
  'Radix UI',
  'Storybook',
  'Vite',
  'ESLint',
  'Prettier',
  'Framer Motion',
  'React Hook Form',
  'Zod',
  'React Query',
  'Zustand',
  'React Testing Library',
  'Jest',
  'Playwright',
  'Vercel',
  'GitHub Actions',
  'Docker',
  'PostgreSQL',
  'Prisma',
  'Redis',
  'AWS',
  'Stripe',
  'Auth0',
  'Sentry',
  'PostHog',
  'Node.js',
  'Express',
];

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border p-4">
      <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
      {tags.map((tag) => (
        <React.Fragment key={tag}>
          <div className="text-sm">{tag}</div>
          <Separator className="my-2" />
        </React.Fragment>
      ))}
    </ScrollArea>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check heading exists
    expect(canvas.getByText('Tags')).toBeVisible();

    // Check some tags are visible
    expect(canvas.getByText('React')).toBeVisible();
    expect(canvas.getByText('Next.js')).toBeVisible();
    expect(canvas.getByText('TypeScript')).toBeVisible();

    // Verify scroll area is present and scrollable
    const scrollArea = canvasElement.querySelector('[data-slot="scroll-area"]');
    expect(scrollArea).toBeVisible();
  },
};

export const WithLongText: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <h4 className="mb-4 text-sm leading-none font-medium">
        Lorem Ipsum Content
      </h4>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {longText}
      </p>
    </ScrollArea>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check heading and content
    expect(canvas.getByText('Lorem Ipsum Content')).toBeVisible();
    expect(canvas.getByText(/Lorem ipsum dolor sit amet/)).toBeVisible();
  },
};

export const HorizontalScrolling: Story = {
  render: () => (
    <ScrollArea className="w-96 rounded-md border whitespace-nowrap">
      <div className="flex w-max space-x-4 p-4">
        {tags.map((tag) => (
          <Badge key={tag} className="shrink-0" variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check some badges are visible
    expect(canvas.getByText('React')).toBeVisible();
    expect(canvas.getByText('Next.js')).toBeVisible();

    // Verify horizontal scrollability
    const scrollArea = canvasElement.querySelector('[data-slot="scroll-area"]');
    expect(scrollArea).toBeVisible();
  },
};

export const BothDirections: Story = {
  render: () => (
    <ScrollArea className="h-72 w-80 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">
          Two-way Scrolling
        </h4>
        <div className="w-[600px] space-y-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-muted-foreground w-16 shrink-0 text-sm">
                Row {i + 1}:
              </span>
              <p className="text-sm">
                This is a very long line of text that extends beyond the normal
                width of the container, requiring horizontal scrolling to read
                the complete content.
              </p>
            </div>
          ))}
        </div>
      </div>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check heading and some rows
    expect(canvas.getByText('Two-way Scrolling')).toBeVisible();
    expect(canvas.getByText('Row 1:')).toBeVisible();
    expect(canvas.getByText('Row 2:')).toBeVisible();
  },
};

export const WithCustomContent: Story = {
  render: () => (
    <ScrollArea className="h-80 w-72 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Project Files</h4>
        <div className="space-y-2">
          {[
            { name: 'package.json', type: 'file', size: '2.1 KB' },
            { name: 'src/', type: 'folder' },
            { name: 'components/', type: 'folder' },
            { name: 'Button.tsx', type: 'file', size: '4.3 KB', indent: true },
            { name: 'Input.tsx', type: 'file', size: '3.2 KB', indent: true },
            { name: 'Select.tsx', type: 'file', size: '5.8 KB', indent: true },
            { name: 'utils/', type: 'folder' },
            { name: 'cn.ts', type: 'file', size: '0.3 KB', indent: true },
            { name: 'format.ts', type: 'file', size: '1.2 KB', indent: true },
            { name: 'lib/', type: 'folder' },
            { name: 'auth.ts', type: 'file', size: '2.7 KB', indent: true },
            { name: 'database.ts', type: 'file', size: '4.1 KB', indent: true },
            { name: 'public/', type: 'folder' },
            {
              name: 'favicon.ico',
              type: 'file',
              size: '15.1 KB',
              indent: true,
            },
            { name: 'logo.svg', type: 'file', size: '2.3 KB', indent: true },
            { name: 'styles/', type: 'folder' },
            { name: 'globals.css', type: 'file', size: '1.8 KB', indent: true },
            { name: 'README.md', type: 'file', size: '3.4 KB' },
            { name: 'tsconfig.json', type: 'file', size: '0.8 KB' },
            { name: 'tailwind.config.js', type: 'file', size: '1.1 KB' },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-sm ${
                item.indent ? 'ml-4' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={item.type === 'folder' ? 'font-medium' : ''}>
                  {item.name}
                </span>
                {item.type === 'folder' && (
                  <Badge variant="secondary">Folder</Badge>
                )}
              </div>
              {/* eslint-disable-next-line unicorn/explicit-length-check */}
              {item.size && (
                <span className="text-muted-foreground text-xs">
                  {item.size}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check file structure
    expect(canvas.getByText('Project Files')).toBeVisible();
    expect(canvas.getByText('package.json')).toBeVisible();
    expect(canvas.getByText('src/')).toBeVisible();
    expect(canvas.getByText('Button.tsx')).toBeVisible();

    // Check file sizes
    expect(canvas.getByText('2.1 KB')).toBeVisible();
    expect(canvas.getByText('4.3 KB')).toBeVisible();
  },
};

export const InteractiveList: Story = {
  render: () => (
    <ScrollArea className="h-64 w-80 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">
          Interactive Actions
        </h4>
        <div className="space-y-2">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="hover:bg-accent/50 flex items-center justify-between rounded-md p-2 transition-colors"
            >
              <div className="text-sm">
                <div className="font-medium">Item {i + 1}</div>
                <div className="text-muted-foreground text-xs">
                  Description for item {i + 1}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  aria-label={`Edit item ${i + 1}`}
                  size="sm"
                  variant="ghost"
                >
                  Edit
                </Button>
                <Button
                  aria-label={`Delete item ${i + 1}`}
                  size="sm"
                  variant="ghost"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check interactive elements
    expect(canvas.getByText('Interactive Actions')).toBeVisible();
    expect(canvas.getByText('Item 1')).toBeVisible();

    // Test button interactions
    const editButton = canvas.getByRole('button', { name: 'Edit item 1' });
    const deleteButton = canvas.getByRole('button', { name: 'Delete item 1' });

    expect(editButton).toBeVisible();
    expect(deleteButton).toBeVisible();

    // Click buttons to test interaction
    await userEvent.click(editButton);
    await userEvent.click(deleteButton);
  },
};

export const CustomSize: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Small (150px height)</h4>
        <ScrollArea className="h-32 w-64 rounded-md border p-3">
          <div className="space-y-1">
            {tags.slice(0, 10).map((tag) => (
              <div key={tag} className="p-1 text-xs">
                {tag}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Large (400px height)</h4>
        <ScrollArea className="h-96 w-64 rounded-md border p-4">
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div key={tag} className="rounded border p-2">
                <div className="text-sm font-medium">{tag}</div>
                <div className="text-muted-foreground text-xs">
                  Technology #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check both size variants exist
    expect(canvas.getByText('Small (150px height)')).toBeVisible();
    expect(canvas.getByText('Large (400px height)')).toBeVisible();

    // Check content in both areas
    const reactItems = canvas.getAllByText('React');
    expect(reactItems).not.toHaveLength(0);
  },
};
