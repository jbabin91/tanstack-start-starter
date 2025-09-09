import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PostNotFoundComponent } from '@/modules/posts/components/post-not-found';

// Mock the layouts to simplify testing
vi.mock('@/components/layouts/centered-layout', () => ({
  CenteredLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="centered-layout">{children}</div>
  ),
}));

// Mock TanStack Router Link component specifically for this test
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} to={to} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock global history for the Go back button
const mockHistoryBack = vi.fn();
Object.defineProperty(globalThis, 'history', {
  value: {
    back: mockHistoryBack,
  },
  writable: true,
});

describe('PostNotFoundComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the post not found message', () => {
    render(<PostNotFoundComponent />);

    expect(screen.getByText('Post not found')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<PostNotFoundComponent />);

    expect(
      screen.getByRole('button', { name: /go back/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });

  it('should call history.back() when Go back button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostNotFoundComponent />);

    const goBackButton = screen.getByRole('button', { name: /go back/i });
    await user.click(goBackButton);

    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<PostNotFoundComponent />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveAttribute('tabIndex', '-1');
  });

  it('should render home link with correct route', () => {
    render(<PostNotFoundComponent />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    // TanStack Router Link is mocked in global setup to return the to prop as href
    expect(homeLink).toHaveAttribute('to', '/');
  });

  it('should use the CenteredLayout', () => {
    render(<PostNotFoundComponent />);

    expect(screen.getByTestId('centered-layout')).toBeInTheDocument();
  });
});
