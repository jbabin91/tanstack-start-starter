import { describe, expect, it, vi } from 'vitest';

// Mock TanStack Start server function
vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    validator: vi.fn().mockReturnThis(),
    handler: vi.fn().mockImplementation((handlerFn) => handlerFn),
  })),
}));

// Mock the database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  db: mockDb,
}));

// Mock the database schema
vi.mock('@/lib/db/schemas/posts', () => ({
  posts: {
    id: 'posts.id',
    title: 'posts.title',
    content: 'posts.content',
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}));

// Mock the logger specifically for this test
vi.mock('@/lib/logger', () => ({
  apiLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('fetchPostById API function', () => {
  it('should fetch a post by ID successfully', async () => {
    // Setup mocks
    const mockPost = {
      id: 'test-id',
      title: 'Test Post',
      content: 'Test content',
    };

    mockDb.where.mockResolvedValue([mockPost]);

    // Import the function after mocks are set up
    const { fetchPostById } = await import('@/modules/posts/api/get-post');

    // Call the function handler directly
    const result = await fetchPostById({ data: 'test-id' });

    // Verify result
    expect(result).toEqual(mockPost);
  });

  it('should throw error when post is not found', async () => {
    // Setup mocks to return empty array
    mockDb.where.mockResolvedValue([]);

    // Import the function after mocks are set up
    const { fetchPostById } = await import('@/modules/posts/api/get-post');

    // Call the function and expect it to throw
    await expect(fetchPostById({ data: 'nonexistent-id' })).rejects.toThrow(
      'Post with id nonexistent-id not found',
    );
  });

  it('should log the request using apiLogger', async () => {
    // Setup mocks
    const mockPost = {
      id: 'test-id',
      title: 'Test Post',
      content: 'Test content',
    };

    mockDb.where.mockResolvedValue([mockPost]);

    // Import logger to get the mocked version
    const { apiLogger } = await import('@/lib/logger');

    // Import the function after mocks are set up
    const { fetchPostById } = await import('@/modules/posts/api/get-post');

    // Call the function
    await fetchPostById({ data: 'test-id' });

    // Verify logging - apiLogger.info should be a mock function from global setup
    expect(apiLogger.info).toHaveBeenCalledWith(
      'Fetching post with id test-id...',
    );
  });
});
