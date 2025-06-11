import { cn } from '@/utils/cn';

type CenteredLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * CenteredLayout is a React component that provides a flexible, centered layout for its children.
 * It uses Flexbox to center the content both vertically and horizontally, making it suitable for various types of content.
 * The layout is designed to take up the full height of the viewport, ensuring that the content is always centered regardless of screen size.
 * @param children - The content to be displayed within the centered layout.
 * @param className - Optional additional CSS classes to apply to the layout.
 * @returns A centered layout container.
 */
export function CenteredLayout({ children, className }: CenteredLayoutProps) {
  return (
    <div
      className={cn('flex min-h-screen flex-col items-center p-4', className)}
    >
      {children}
    </div>
  );
}
