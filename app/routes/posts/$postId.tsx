import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  ErrorComponent,
  type ErrorComponentProps,
  Link,
} from '@tanstack/react-router';

import { NotFound } from '~/components/not-found';
import { postQueryOptions } from '~/utils/posts';

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
  errorComponent: PostErrorComponent,
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  loader: async ({ params: { postId }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      postQueryOptions(postId),
    );

    return {
      title: data.title,
    };
  },
  notFoundComponent: () => {
    return <NotFound>Post not found</NotFound>;
  },
});

export function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function PostComponent() {
  const { postId } = Route.useParams();
  const postQuery = useSuspenseQuery(postQueryOptions(postId));

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">{postQuery.data.title}</h4>
      <div className="text-sm">{postQuery.data.body}</div>
      <Link
        activeProps={{ className: 'text-black font-bold' }}
        className="block py-1 text-blue-800 hover:text-blue-600"
        params={{
          postId: postQuery.data.id,
        }}
        to="/posts/$postId/deep"
      >
        Deep View
      </Link>
    </div>
  );
}
