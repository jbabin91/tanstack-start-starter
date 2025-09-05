import { cn } from '@/utils/cn';

type CenteredLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function CenteredLayout({ children, className }: CenteredLayoutProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
