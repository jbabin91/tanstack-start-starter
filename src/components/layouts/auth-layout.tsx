import { cn } from '@/utils/cn';

type AuthLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="bg-background flex h-full justify-center px-4 py-12">
      <div className={cn('w-full max-w-md space-y-4', className)}>
        {children}
      </div>
    </div>
  );
}
