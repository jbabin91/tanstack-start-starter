import { NotFound } from '@/components/errors/not-found';

export function UserNotFoundComponent() {
  return (
    <div className="p-4">
      <NotFound>User not found</NotFound>
    </div>
  );
}
