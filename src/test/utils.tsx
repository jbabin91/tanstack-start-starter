import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

// Custom render function that includes providers
function customRender(ui: ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { customRender as render };

/**
 * Type guard to check if a value is an Element that can have computed styles
 * @param element - The value to check
 * @returns true if element is an Element, false otherwise
 */
function isElement(element: unknown): element is Element {
  return element instanceof Element;
}

/**
 * Helper function to check if an element is visible by checking computed styles.
 * Useful for testing portal components and animation states where elements might
 * be present in the DOM but not visually visible.
 *
 * @param element - The element to check visibility for (can be any value for convenience)
 * @returns true if element is visible, false if not visible or not an Element
 */
export function isElementVisible(element: unknown): element is Element {
  // Type guard with early return for non-elements
  if (!isElement(element)) return false;

  // Now TypeScript knows element is Element
  const style = globalThis.getComputedStyle(element);

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}
