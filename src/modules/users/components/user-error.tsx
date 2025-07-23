import {
  ErrorComponent,
  type ErrorComponentProps,
} from '@tanstack/react-router';

export function UserErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="p-4">
      <ErrorComponent error={error} />
    </div>
  );
}
