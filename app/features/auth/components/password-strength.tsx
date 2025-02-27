import { cn } from '~/lib/utils';

type PasswordStrengthProps = {
  password: string;
};

const strengthLevels = ['very-weak', 'weak', 'fair', 'good', 'strong'] as const;

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = {
    lowercase: /[a-z]/.test(password),
    minLength: password.length >= 8,
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {strengthLevels.map((level, i) => (
          <div
            key={level}
            className={cn(
              'h-2 w-full rounded-full',
              i < strength
                ? strength <= 2
                  ? 'bg-destructive'
                  : strength <= 3
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                : 'bg-muted',
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div
          className={cn(
            'flex items-center gap-1',
            checks.minLength ? 'text-green-500' : 'text-muted-foreground',
          )}
        >
          {checks.minLength ? '✓' : '○'} At least 8 characters
        </div>
        <div
          className={cn(
            'flex items-center gap-1',
            checks.number ? 'text-green-500' : 'text-muted-foreground',
          )}
        >
          {checks.number ? '✓' : '○'} At least 1 number
        </div>
        <div
          className={cn(
            'flex items-center gap-1',
            checks.lowercase ? 'text-green-500' : 'text-muted-foreground',
          )}
        >
          {checks.lowercase ? '✓' : '○'} At least 1 lowercase
        </div>
        <div
          className={cn(
            'flex items-center gap-1',
            checks.uppercase ? 'text-green-500' : 'text-muted-foreground',
          )}
        >
          {checks.uppercase ? '✓' : '○'} At least 1 uppercase
        </div>
        <div
          className={cn(
            'flex items-center gap-1',
            checks.special ? 'text-green-500' : 'text-muted-foreground',
          )}
        >
          {checks.special ? '✓' : '○'} At least 1 special character
        </div>
      </div>
    </div>
  );
}
