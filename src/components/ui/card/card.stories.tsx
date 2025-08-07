import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta = {
  title: 'UI/Surfaces/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a description of the card content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Here&apos;s some main content for the card.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Project Setup</CardTitle>
        <CardDescription>Configure your new project settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Complete the initial setup process for your project.</p>
      </CardContent>
      <CardFooter>
        <Button color="primary" size="sm">
          Get Started
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
        <CardAction>
          <Button size="icon" variant="text">
            <Icons.moreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Configure when and how you receive notifications.</p>
      </CardContent>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>John Doe</CardTitle>
        <CardDescription>Software Engineer</CardDescription>
        <CardAction>
          <Button size="sm" variant="outlined">
            Follow
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Icons.mapPin className="mr-1 size-3" />
            San Francisco, CA
          </div>
          <div className="flex items-center">
            <Icons.calendar className="mr-1 size-3" />
            Joined March 2023
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="text-muted-foreground flex w-full justify-between text-sm">
          <span>124 followers</span>
          <span>89 following</span>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <Card className="w-[200px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Icons.dollarSign className="text-muted-foreground size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$45,231.89</div>
        <p className="text-muted-foreground text-xs">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icons.fileText className="text-muted-foreground size-10" />
        <CardTitle className="mt-4">No documents found</CardTitle>
        <CardDescription className="mt-2 text-center">
          You haven&apos;t created any documents yet. Get started by creating
          your first document.
        </CardDescription>
        <Button className="mt-4">Create Document</Button>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] cursor-pointer transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>
          This card responds to hover and click interactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Hover over this card to see the shadow effect.</p>
      </CardContent>
    </Card>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test card structure by text content
    const title = canvas.getByText('Interactive Card');
    const description = canvas.getByText(/this card responds to hover/i);
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // Test that parent container has card data attribute
    const cardContainer = title.closest('[data-slot="card"]');
    expect(cardContainer).toBeInTheDocument();
    expect(cardContainer).toBeVisible();
    expect(cardContainer).toHaveAttribute('data-slot', 'card');

    // Test that card has correct styling classes
    expect(cardContainer).toHaveClass('rounded-xl', 'border', 'shadow-sm');
  },
};

export const LoadingCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="animate-pulse space-y-2">
          <div className="bg-muted h-4 w-3/4 rounded"></div>
          <div className="bg-muted h-3 w-1/2 rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-2">
          <div className="bg-muted h-3 rounded"></div>
          <div className="bg-muted h-3 w-5/6 rounded"></div>
          <div className="bg-muted h-3 w-4/6 rounded"></div>
        </div>
      </CardContent>
    </Card>
  ),
};
