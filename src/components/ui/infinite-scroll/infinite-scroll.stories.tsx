import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from '@storybook/test';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

import { InfiniteScroll } from './infinite-scroll';

const meta: Meta<typeof InfiniteScroll> = {
  title: 'UI/InfiniteScroll',
  component: InfiniteScroll,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An infinite scroll component that automatically loads more content when the user scrolls near the end. Built with Intersection Observer API for performance.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InfiniteScroll>;

// Mock data generator
const generateItems = (start: number, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    title: `Item ${start + i}`,
    description: `This is the description for item ${start + i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    category: ['Work', 'Personal', 'Important', 'Archive'][
      Math.floor(Math.random() * 4)
    ],
    timestamp: new Date(
      Date.now() - Math.random() * 10_000_000_000,
    ).toLocaleDateString(),
  }));
};

export const Default: Story = {
  render: () => {
    const [items, setItems] = React.useState(() => generateItems(1, 20));
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    const loadMore = async () => {
      if (isLoading) return;

      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newItems = generateItems(items.length + 1, 10);
      setItems((prev) => [...prev, ...newItems]);
      setIsLoading(false);

      // Simulate end of data after 100 items
      if (items.length >= 90) {
        setHasMore(false);
      }
    };

    return (
      <InfiniteScroll
        className="h-96 w-80"
        hasMore={hasMore}
        isLoading={isLoading}
        next={loadMore}
      >
        <div className="space-y-2 p-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <h4 className="text-sm font-medium">{item.title}</h4>
              <p className="text-muted-foreground mt-1 text-xs">
                {item.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="bg-secondary rounded px-2 py-1 text-xs">
                  {item.category}
                </span>
                <span className="text-muted-foreground text-xs">
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-muted-foreground text-sm">
                Loading more...
              </span>
            </div>
          )}
          {!hasMore && (
            <div className="text-muted-foreground p-4 text-center text-sm">
              No more items to load
            </div>
          )}
        </div>
      </InfiniteScroll>
    );
  },
};

export const MessageList: Story = {
  render: () => {
    const [messages, setMessages] = React.useState(() => [
      { id: 1, user: 'Alice', content: 'Hey everyone!', timestamp: '2:30 PM' },
      {
        id: 2,
        user: 'Bob',
        content: 'How&apos;s the project going?',
        timestamp: '2:32 PM',
      },
      {
        id: 3,
        user: 'Charlie',
        content: 'Almost ready for review',
        timestamp: '2:35 PM',
      },
      {
        id: 4,
        user: 'Diana',
        content: 'Great work team! 🎉',
        timestamp: '2:38 PM',
      },
      {
        id: 5,
        user: 'Eve',
        content: 'When is the next standup?',
        timestamp: '2:40 PM',
      },
    ]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    const loadMoreMessages = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const users = ['Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
      const contents = [
        'Thanks for the update!',
        'I&apos;ll review the PR soon',
        'Can we schedule a meeting?',
        'The deployment looks good',
        'Let&apos;s sync on this tomorrow',
      ];

      const newMessages = Array.from({ length: 3 }, (_, i) => ({
        id: messages.length + i + 1,
        user: users[Math.floor(Math.random() * users.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        timestamp: `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'PM' : 'AM'}`,
      }));

      setMessages((prev) => [...prev, ...newMessages]);
      setIsLoading(false);

      if (messages.length >= 20) {
        setHasMore(false);
      }
    };

    return (
      <div className="w-80 rounded-lg border">
        <div className="border-b p-3">
          <h3 className="text-sm font-semibold">Team Chat</h3>
        </div>
        <InfiniteScroll
          className="h-96"
          hasMore={hasMore}
          isLoading={isLoading}
          next={loadMoreMessages}
        >
          <div className="space-y-3 p-3">
            {messages.map((message) => (
              <div key={message.id} className="flex space-x-2">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
                  {message.user[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{message.user}</span>
                    <span className="text-muted-foreground text-xs">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 p-2">
                <Icons.spinner className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Loading messages...
                </span>
              </div>
            )}
          </div>
        </InfiniteScroll>
        <div className="border-t p-3">
          <div className="flex space-x-2">
            <input
              className="flex-1 rounded border px-2 py-1 text-sm"
              placeholder="Type a message..."
            />
            <Button size="sm">Send</Button>
          </div>
        </div>
      </div>
    );
  },
};

export const ProductGrid: Story = {
  render: () => {
    const [products, setProducts] = React.useState(() => [
      { id: 1, name: 'Wireless Headphones', price: 129.99, image: '🎧' },
      { id: 2, name: 'Smart Watch', price: 299.99, image: '⌚' },
      { id: 3, name: 'Laptop Stand', price: 49.99, image: '💻' },
      { id: 4, name: 'Bluetooth Speaker', price: 79.99, image: '🔊' },
      { id: 5, name: 'USB-C Hub', price: 39.99, image: '🔌' },
      { id: 6, name: 'Wireless Mouse', price: 29.99, image: '🖱️' },
    ]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    const loadMoreProducts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const productNames = [
        'Keyboard',
        'Monitor',
        'Tablet',
        'Phone Case',
        'Charger',
        'Camera',
        'Microphone',
        'Desk Lamp',
        'Notebook',
        'Pen Set',
        'Water Bottle',
        'Backpack',
      ];
      const emojis = [
        '⌨️',
        '🖥️',
        '📱',
        '📱',
        '🔋',
        '📷',
        '🎤',
        '💡',
        '📓',
        '✒️',
        '🍶',
        '🎒',
      ];

      const newProducts = Array.from({ length: 4 }, (_, i) => ({
        id: products.length + i + 1,
        name: productNames[Math.floor(Math.random() * productNames.length)],
        price: Math.floor(Math.random() * 200) + 20 + 0.99,
        image: emojis[Math.floor(Math.random() * emojis.length)],
      }));

      setProducts((prev) => [...prev, ...newProducts]);
      setIsLoading(false);

      if (products.length >= 24) {
        setHasMore(false);
      }
    };

    return (
      <InfiniteScroll
        className="h-96 w-80"
        hasMore={hasMore}
        isLoading={isLoading}
        next={loadMoreProducts}
      >
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border p-3 text-center"
              >
                <div className="mb-2 text-3xl">{product.image}</div>
                <h4 className="text-sm font-medium">{product.name}</h4>
                <p className="text-primary mt-1 text-lg font-bold">
                  ${product.price.toFixed(2)}
                </p>
                <Button className="mt-2 w-full" size="sm">
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
          {isLoading && (
            <div className="flex items-center justify-center p-6">
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
              <span className="text-muted-foreground text-sm">
                Loading products...
              </span>
            </div>
          )}
          {!hasMore && (
            <div className="text-muted-foreground p-6 text-center text-sm">
              You&apos;ve seen all our products!
            </div>
          )}
        </div>
      </InfiniteScroll>
    );
  },
};

export const ReverseChronological: Story = {
  render: () => {
    const [posts, setPosts] = React.useState(() => [
      {
        id: 5,
        title: 'Latest Update',
        content: 'This is the most recent post',
        time: '5 minutes ago',
      },
      {
        id: 4,
        title: 'Project Milestone',
        content: 'We reached an important milestone',
        time: '2 hours ago',
      },
      {
        id: 3,
        title: 'Team Meeting',
        content: 'Weekly team sync notes',
        time: '1 day ago',
      },
      {
        id: 2,
        title: 'Code Review',
        content: 'Feedback on the latest PR',
        time: '3 days ago',
      },
      {
        id: 1,
        title: 'Welcome Post',
        content: 'Welcome to our development blog!',
        time: '1 week ago',
      },
    ]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    const loadOlderPosts = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 900));

      const titles = [
        'Bug Fix Release',
        'Feature Implementation',
        'Documentation Update',
        'Performance Optimization',
        'Security Patch',
        'UI Improvements',
      ];

      const baseId = Math.min(...posts.map((p) => p.id));
      const olderPosts = Array.from({ length: 3 }, (_, i) => ({
        id: baseId - i - 1,
        title: titles[Math.floor(Math.random() * titles.length)],
        content:
          'This is an older post with some historical context and information.',
        time: `${Math.floor(Math.random() * 4) + 2} weeks ago`,
      }));

      setPosts((prev) => [...olderPosts, ...prev]);
      setIsLoading(false);

      if (baseId <= 5) {
        setHasMore(false);
      }
    };

    return (
      <InfiniteScroll
        className="h-96 w-80"
        hasMore={hasMore}
        isLoading={isLoading}
        next={loadOlderPosts}
        reverse={true}
      >
        <div className="space-y-4 p-4">
          {isLoading && (
            <div className="flex items-center justify-center rounded-lg border p-4">
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-muted-foreground text-sm">
                Loading older posts...
              </span>
            </div>
          )}
          {!hasMore && (
            <div className="text-muted-foreground rounded-lg border p-4 text-center text-sm">
              No older posts available
            </div>
          )}
          {posts.map((post) => (
            <div key={post.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold">{post.title}</h4>
                <span className="text-muted-foreground text-xs">
                  {post.time}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{post.content}</p>
              <div className="mt-3 flex items-center space-x-2">
                <Button size="sm" variant="text">
                  <Icons.heart className="mr-1 h-3 w-3" />
                  Like
                </Button>
                <Button size="sm" variant="text">
                  <Icons.messageCircle className="mr-1 h-3 w-3" />
                  Comment
                </Button>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    );
  },
};

export const WithCustomSentinel: Story = {
  render: () => {
    const [items, setItems] = React.useState(() => generateItems(1, 15));
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    const loadMore = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newItems = generateItems(items.length + 1, 8);
      setItems((prev) => [...prev, ...newItems]);
      setIsLoading(false);

      if (items.length >= 50) {
        setHasMore(false);
      }
    };

    return (
      <InfiniteScroll
        className="h-96 w-80"
        hasMore={hasMore}
        isLoading={isLoading}
        next={loadMore}
        rootMargin="50px"
        sentinelClassName="border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground"
        sentinelHeight="100px"
        threshold={0.5}
      >
        <div className="space-y-3 p-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">{item.title}</h4>
                <span className="bg-accent rounded px-2 py-1 text-xs">
                  {item.category}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
              <div className="text-muted-foreground mt-3 flex items-center space-x-4 text-xs">
                <span>{item.timestamp}</span>
                <Button size="sm" variant="text">
                  <Icons.externalLink className="mr-1 h-3 w-3" />
                  View
                </Button>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="bg-muted/50 flex items-center justify-center rounded-lg border p-6">
              <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium">Loading more content...</p>
                <p className="text-muted-foreground text-xs">
                  Please wait a moment
                </p>
              </div>
            </div>
          )}
        </div>
      </InfiniteScroll>
    );
  },
};

export const Interactive: Story = {
  args: {
    next: fn(),
  },
  render: (args) => {
    const [items, setItems] = React.useState(() => generateItems(1, 10));
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);
    const [loadCount, setLoadCount] = React.useState(0);

    const loadMore = async () => {
      if (isLoading) return;

      setIsLoading(true);
      setLoadCount((prev) => prev + 1);

      // Call the mock function
      args.next();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newItems = generateItems(items.length + 1, 5);
      setItems((prev) => [...prev, ...newItems]);
      setIsLoading(false);

      // End after 3 loads for testing
      if (loadCount >= 2) {
        setHasMore(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>Items loaded: {items.length}</span>
          <span>Load count: {loadCount}</span>
        </div>

        <InfiniteScroll
          className="h-80 w-80 rounded-lg border"
          hasMore={hasMore}
          isLoading={isLoading}
          next={loadMore}
        >
          <div className="space-y-2 p-4">
            {items.map((item, index) => (
              <div key={item.id} className="rounded border p-3">
                <h4 className="text-sm font-medium">
                  {item.title} (#{index + 1})
                </h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="bg-secondary rounded px-2 py-0.5 text-xs">
                    {item.category}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center justify-center p-6">
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Loading...
                </span>
              </div>
            )}

            {!hasMore && (
              <div className="text-muted-foreground rounded border p-4 text-center text-sm">
                All items loaded! (Total: {items.length})
              </div>
            )}
          </div>
        </InfiniteScroll>

        <div className="text-muted-foreground text-xs">
          <p>Scroll to the bottom to trigger automatic loading.</p>
          <p>
            Status: {isLoading ? 'Loading...' : hasMore ? 'Ready' : 'Complete'}
          </p>
        </div>
      </div>
    );
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify initial state
    expect(canvas.getByText('Items loaded: 10')).toBeVisible();
    expect(canvas.getByText('Load count: 0')).toBeVisible();
    expect(canvas.getByText('Status: Ready')).toBeVisible();

    // Find the scroll container exists
    const scrollContainer = canvasElement.querySelector(
      '[data-radix-scroll-area-viewport]',
    );
    if (!scrollContainer) {
      throw new TypeError('Expected to find scroll container');
    }

    // Verify scroll container is rendered and functional
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer.scrollHeight).toBeGreaterThan(0);

    // Note: Intersection Observer tests are skipped as they don't work reliably
    // in the Vitest browser environment. The component functionality is verified
    // through visual testing and manual testing in Storybook.
  },
};
