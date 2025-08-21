import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { isElementVisible } from '@/test/utils';

import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

const meta: Meta<typeof HoverCard> = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A hover card component that displays rich content when hovering over a trigger element. Built on top of Radix UI primitives with portal rendering.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@shadcn</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@shadcn</h4>
            <p className="text-sm">
              The React framework – created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-2">
              <Icons.calendar className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-muted-foreground text-xs">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <span className="text-muted-foreground text-sm">Designed by</span>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button className="p-0 font-semibold" variant="link">
            Jane Cooper
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
              JC
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold">Jane Cooper</h4>
              <p className="text-muted-foreground text-sm">
                Senior Product Designer at Vercel. Previously at GitHub and
                Figma.
              </p>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center">
                  <Icons.users className="mr-1 h-3 w-3 opacity-70" />
                  <span className="text-muted-foreground text-xs">
                    1.2k followers
                  </span>
                </div>
                <div className="flex items-center">
                  <Icons.calendar className="mr-1 h-3 w-3 opacity-70" />
                  <span className="text-muted-foreground text-xs">
                    Joined March 2019
                  </span>
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <div className="max-w-md rounded-lg border p-4">
      <h3 className="mb-2 font-semibold">Featured Products</h3>
      <div className="space-y-2">
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              className="hover:bg-accent/50 w-full rounded p-2 text-left"
              type="button"
            >
              <div className="font-medium">Next.js 14</div>
              <div className="text-muted-foreground text-sm">
                The React Framework for Production
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-96">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-black">
                  <span className="text-lg font-bold text-white">N</span>
                </div>
                <div>
                  <h4 className="font-semibold">Next.js 14</h4>
                  <p className="text-muted-foreground text-sm">by Vercel</p>
                </div>
              </div>
              <p className="text-sm">
                Used by some of the world&apos;s largest companies, Next.js
                enables you to create full-stack web applications by extending
                the latest React features, and integrating powerful Rust-based
                JavaScript tooling.
              </p>
              <div className="text-muted-foreground flex items-center space-x-4 text-xs">
                <div className="flex items-center">
                  <Icons.activity className="mr-1 h-3 w-3" />
                  118k stars
                </div>
                <div className="flex items-center">
                  <Icons.users className="mr-1 h-3 w-3" />
                  2.5k contributors
                </div>
                <div className="flex items-center">
                  <Icons.circle className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                  JavaScript
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              className="hover:bg-accent/50 w-full rounded p-2 text-left"
              type="button"
            >
              <div className="font-medium">Tailwind CSS</div>
              <div className="text-muted-foreground text-sm">
                A utility-first CSS framework
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-gradient-to-br from-cyan-500 to-blue-600">
                  <span className="text-lg font-bold text-white">T</span>
                </div>
                <div>
                  <h4 className="font-semibold">Tailwind CSS</h4>
                  <p className="text-muted-foreground text-sm">
                    by Tailwind Labs
                  </p>
                </div>
              </div>
              <p className="text-sm">
                Rapidly build modern websites without ever leaving your HTML. A
                utility-first CSS framework packed with classes like flex, pt-4,
                text-center and rotate-90.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
};

export const LinkPreview: Story = {
  render: () => (
    <div className="max-w-lg space-y-4 text-sm leading-relaxed">
      <p>
        When you&apos;re building a modern web application, you&apos;ll want to
        use{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
              type="button"
            >
              React
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icons.activity className="h-4 w-4" />
                <h4 className="font-semibold">React</h4>
              </div>
              <p className="text-sm">
                A JavaScript library for building user interfaces. Maintained by
                Meta and used by millions of developers worldwide.
              </p>
              <div className="text-muted-foreground flex items-center space-x-4 pt-2 text-xs">
                <span>• Declarative</span>
                <span>• Component-based</span>
                <span>• Learn once, write anywhere</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>{' '}
        for your frontend, paired with{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              className="text-green-600 underline underline-offset-2 hover:text-green-800"
              type="button"
            >
              Node.js
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icons.zap className="h-4 w-4" />
                <h4 className="font-semibold">Node.js</h4>
              </div>
              <p className="text-sm">
                A JavaScript runtime built on Chrome&apos;s V8 JavaScript
                engine. Perfect for building fast, scalable network
                applications.
              </p>
              <div className="text-muted-foreground flex items-center space-x-4 pt-2 text-xs">
                <span>• Server-side JavaScript</span>
                <span>• NPM ecosystem</span>
                <span>• Event-driven</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>{' '}
        on the backend. This combination provides a powerful full-stack
        development experience.
      </p>
      <p>
        For styling, consider using{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              className="text-cyan-600 underline underline-offset-2 hover:text-cyan-800"
              type="button"
            >
              Tailwind CSS
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icons.palette className="h-4 w-4" />
                <h4 className="font-semibold">Tailwind CSS</h4>
              </div>
              <p className="text-sm">
                A utility-first CSS framework that provides low-level utility
                classes to build custom designs without writing CSS.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>{' '}
        which offers excellent developer experience and performance.
      </p>
    </div>
  ),
};

export const StatCard: Story = {
  render: () => (
    <div className="grid max-w-md grid-cols-2 gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="hover:bg-accent/50 cursor-pointer rounded-lg border p-4 transition-colors">
            <div className="flex items-center space-x-2">
              <Icons.users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Users</span>
            </div>
            <div className="mt-2 text-2xl font-bold">1,234</div>
            <div className="text-muted-foreground text-xs">
              +12% from last month
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-2">
            <h4 className="font-semibold">User Growth</h4>
            <p className="text-sm">
              Active users have increased by 12% compared to last month, with 89
              new signups this week.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div>
                <div className="font-medium">New users</div>
                <div className="text-muted-foreground">89 this week</div>
              </div>
              <div>
                <div className="font-medium">Retention</div>
                <div className="text-muted-foreground">84% monthly</div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="hover:bg-accent/50 cursor-pointer rounded-lg border p-4 transition-colors">
            <div className="flex items-center space-x-2">
              <Icons.dollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="mt-2 text-2xl font-bold">$12.5k</div>
            <div className="text-muted-foreground text-xs">
              +8% from last month
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-2">
            <h4 className="font-semibold">Revenue Breakdown</h4>
            <p className="text-sm">
              Monthly recurring revenue increased by 8% with strong performance
              in subscription upgrades.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div>
                <div className="font-medium">Subscriptions</div>
                <div className="text-muted-foreground">$9.2k (74%)</div>
              </div>
              <div>
                <div className="font-medium">One-time</div>
                <div className="text-muted-foreground">$3.3k (26%)</div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const DocumentationLinks: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold">API Reference</h2>
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium">React Hooks</h3>
          <div className="space-y-1 text-sm">
            <div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <code className="bg-muted hover:bg-muted/80 cursor-pointer rounded px-1 py-0.5 text-xs">
                    useState
                  </code>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-mono text-sm font-semibold">
                      useState(initialState)
                    </h4>
                    <p className="text-sm">
                      Returns a stateful value, and a function to update it. The
                      initial state argument is the state used during the first
                      render.
                    </p>
                    <div className="bg-muted rounded p-2 font-mono text-xs">
                      const [count, setCount] = useState(0);
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              {' - Returns a stateful value and a function to update it.'}
            </div>
            <div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <code className="bg-muted hover:bg-muted/80 cursor-pointer rounded px-1 py-0.5 text-xs">
                    useEffect
                  </code>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-mono text-sm font-semibold">
                      useEffect(effect, deps?)
                    </h4>
                    <p className="text-sm">
                      Accepts a function that contains imperative, possibly
                      effectful code. Mutations, subscriptions, timers, logging,
                      and other side effects are not allowed inside the main
                      body of a function component.
                    </p>
                    <div className="bg-muted rounded p-2 font-mono text-xs">
                      {'useEffect(() => {\n  // effect\n}, [deps]);'}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              {' - Performs side effects in function components.'}
            </div>
            <div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <code className="bg-muted hover:bg-muted/80 cursor-pointer rounded px-1 py-0.5 text-xs">
                    useContext
                  </code>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-mono text-sm font-semibold">
                      useContext(MyContext)
                    </h4>
                    <p className="text-sm">
                      Accepts a context object (the value returned from
                      React.createContext) and returns the current context value
                      for that context.
                    </p>
                    <div className="bg-muted rounded p-2 font-mono text-xs">
                      const value = useContext(MyContext);
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              {' - Consumes context values from a React Context.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    onOpenChange: fn(),
  },
  render: (args) => {
    const [userData] = React.useState({
      name: 'Alice Johnson',
      handle: '@alice_codes',
      bio: 'Full-stack developer passionate about React, TypeScript, and accessible design.',
      followers: 1847,
      following: 329,
      joinDate: 'March 2020',
      location: 'San Francisco, CA',
      website: 'alice-codes.dev',
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground text-sm">Meet our team:</span>
          <HoverCard onOpenChange={args.onOpenChange}>
            <HoverCardTrigger asChild>
              <Button className="h-auto p-0 font-semibold" variant="link">
                {userData.handle}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-lg font-medium text-white">
                  {userData.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-semibold">{userData.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    {userData.handle}
                  </p>
                  <p className="text-sm">{userData.bio}</p>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="text-muted-foreground flex items-center text-xs">
                      <Icons.users className="mr-1 h-3 w-3" />
                      <span className="font-medium">
                        {userData.followers}
                      </span>{' '}
                      followers
                    </div>
                    <div className="text-muted-foreground flex items-center text-xs">
                      <span className="font-medium">{userData.following}</span>{' '}
                      following
                    </div>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-4 text-xs">
                    <div className="flex items-center">
                      <Icons.calendar className="mr-1 h-3 w-3" />
                      Joined {userData.joinDate}
                    </div>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-4 text-xs">
                    <div className="flex items-center">
                      <Icons.mapPin className="mr-1 h-3 w-3" />
                      {userData.location}
                    </div>
                    <div className="flex items-center">
                      <Icons.globe className="mr-1 h-3 w-3" />
                      {userData.website}
                    </div>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="text-muted-foreground text-sm">
          <p>Hover over the username above to see the profile card.</p>
          <p>
            The card will appear after a short delay and disappear when you stop
            hovering.
          </p>
        </div>
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Find the trigger button
    const trigger = canvas.getByRole('button', { name: '@alice_codes' });
    expect(trigger).toBeVisible();

    // Hover over the trigger to open hover card
    await userEvent.hover(trigger);

    // Wait for hover card to appear (with delay)
    await waitFor(
      () => {
        expect(screen.getByText('Alice Johnson')).toBeVisible();
      },
      { timeout: 2000 },
    );

    // Verify hover card content - scope to content area to avoid duplicate text
    const hoverCardContent: HTMLElement | null =
      screen.getByText('Alice Johnson').closest('[role="dialog"]') ??
      screen
        .getByText('Alice Johnson')
        .closest('[data-radix-popper-content-wrapper]');

    if (!hoverCardContent) {
      throw new TypeError('Expected to find hover card content element');
    }
    expect(within(hoverCardContent).getByText('@alice_codes')).toBeVisible();
    expect(
      screen.getByText(
        'Full-stack developer passionate about React, TypeScript, and accessible design.',
      ),
    ).toBeVisible();
    expect(screen.getByText('1847')).toBeVisible();
    expect(screen.getByText('followers')).toBeVisible();
    expect(screen.getByText('329')).toBeVisible();
    expect(screen.getByText('following')).toBeVisible();
    expect(screen.getByText('Joined March 2020')).toBeVisible();
    expect(screen.getByText('San Francisco, CA')).toBeVisible();
    expect(screen.getByText('alice-codes.dev')).toBeVisible();

    // Test icons are present
    const followersContainer = screen.getByText('1847').closest('div');
    const iconElement =
      screen.getByText('1847').parentElement?.querySelector('[data-slot]') ??
      screen.getByText('1847').parentElement?.querySelector('svg');

    if (
      followersContainer &&
      iconElement && // Type narrowing for proper HTMLElement or SVGElement
      (iconElement instanceof HTMLElement || iconElement instanceof SVGElement)
    ) {
      expect(followersContainer).toContainElement(iconElement);
    }

    // Move mouse away to close hover card
    await userEvent.unhover(trigger);

    // Wait for hover card to disappear
    await waitFor(
      () => {
        const hoverCard: HTMLElement | null =
          screen.queryByText('Alice Johnson');
        expect(hoverCard).toSatisfy(
          (el: HTMLElement | null) => el === null || !isElementVisible(el),
        );
      },
      { timeout: 2000 },
    );

    // Verify onOpenChange was called
    expect(args.onOpenChange).toHaveBeenCalledWith(true);
    expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
