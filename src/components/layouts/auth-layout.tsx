import { cn } from '@/utils/cn';

type AuthLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * AuthLayout provides a centered layout specifically designed for authentication forms.
 * It creates a responsive container that works well on both mobile and desktop devices,
 * with proper spacing and constraints for optimal user experience during authentication flows.
 *
 * @param children - The authentication form content to be displayed
 * @param className - Optional additional CSS classes to apply to the layout
 * @returns A centered authentication layout container
 */
export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className={cn('w-full max-w-md space-y-6', className)}>
        {children}
      </div>
    </div>
  );
}
