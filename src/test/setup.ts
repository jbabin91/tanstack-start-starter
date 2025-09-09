import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Clean up after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock nanoid for consistent test results
vi.mock('@/lib/nanoid', () => ({
  nanoid: vi.fn(() => 'test-id'),
}));

// Mock better-auth client for testing
vi.mock('@/lib/auth/client', () => ({
  auth: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    getSession: vi.fn(),
  },
}));

// Mock Resend for email testing
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));

// Mock router for component testing
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useRouter: vi.fn(() => ({
      navigate: vi.fn(),
    })),
    useRouteContext: vi.fn(() => ({})),
  };
});
