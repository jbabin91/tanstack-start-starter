// TODO: error handling - https://github.com/TanStack/router/issues/2535
// FIXME: return raw response - https://github.com/TanStack/router/issues/2779
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { type APIError } from 'better-auth/api';
import { type LiteralUnion } from 'type-fest';
import { getEvent, getWebRequest, setHeaders } from 'vinxi/http';

import { type ValidLink } from '@/components/ui/link.tsx';
import { type SupportedSocialProviderId } from '@/configs/social-provider.ts';
import { auth, type Authed, type InferAuthResult } from '@/lib/auth.ts';
import { authClient } from '@/lib/auth-client.ts';
import { logger } from '@/lib/logger.ts';
import { tryCatchAsync } from '@/lib/utils.ts';
import { signInSchema, signUpSchema } from '@/modules/auth/schema';

function handleResponse<ResponseBody = unknown>(response: Response) {
  const event = getEvent();

  setHeaders(event, Object.fromEntries(response.headers));

  switch (response.headers.get('Content-Type')) {
    case 'application/json': {
      return response.json() as ResponseBody;
    }
    default: {
      return response.body as ResponseBody;
    }
  }
}

export const getAuth = createServerFn({ method: 'GET' }).handler(() => {
  logger.info('Getting auth...');

  const event = getEvent();

  const auth: Authed | null = event.context.auth ?? null;

  return { ...auth };
});

export const signUp = createServerFn({ method: 'POST' })
  .validator(signUpSchema())
  .handler(async ({ data }) => {
    const request = getWebRequest();

    const [signUpError, signUpResponse] = await tryCatchAsync<APIError, Response>(
      auth.api.signUpEmail({
        asResponse: true,
        body: data,
        headers: request.headers,
      }),
    );

    if (signUpError) {
      throw new Error('TODO: error handling');
    }

    return handleResponse<InferAuthResult<'signUpEmail'>>(signUpResponse);
  });

export const signIn = createServerFn({ method: 'POST' })
  .validator(signInSchema())
  .handler(async ({ data }) => {
    const request = getWebRequest();

    const [signInError, signInResponse] = await tryCatchAsync<APIError, Response>(
      auth.api.signInEmail({
        asResponse: true,
        body: data,
        headers: request.headers,
      }),
    );

    if (signInError) {
      throw new Error('TODO: error handling');
    }

    return handleResponse<InferAuthResult<'signInEmail'>>(signInResponse);
  });

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const request = getWebRequest();

  const [signOutError, signOutResponse] = await tryCatchAsync<APIError, Response>(
    auth.api.signOut({
      asResponse: true,
      headers: request.headers,
    }),
  );

  if (signOutError) {
    throw new Error('TODO: error handling');
  }

  return handleResponse<InferAuthResult<'signOut'>>(signOutResponse);
});

export function authQueryOptions() {
  return queryOptions({
    queryFn: () => getAuth(),
    queryKey: ['getAuth'],
  });
}

export function useAuthQuery() {
  return useSuspenseQuery(authQueryOptions());
}

export function useAuthedQuery() {
  const authQuery = useAuthQuery();

  if (authQuery.data?.isAuthenticated) {
    throw new Error('Not authenticated');
  }

  return authQuery as UseSuspenseQueryResult<Authed>;
}

export type InvalidateOptions = {
  callbackURL?: LiteralUnion<ValidLink, string>;
};

export function useAuthInvalidate() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return function invalidate(invalidateOptions?: InvalidateOptions) {
    return async () => {
      await queryClient.invalidateQueries(authQueryOptions());

      if (invalidateOptions?.callbackURL) {
        await router.navigate({ to: invalidateOptions.callbackURL });
      }

      await router.invalidate();
    };
  };
}

export function useSignUpMutation(invalidateOptions?: InvalidateOptions) {
  const invalidateAuth = useAuthInvalidate();

  return useMutation({
    mutationFn: signUp,
    onSuccess: invalidateAuth(invalidateOptions),
  });
}

export function useSignInMutation(invalidateOptions?: InvalidateOptions) {
  const invalidateAuth = useAuthInvalidate();

  return useMutation({
    mutationFn: signIn,
    onSuccess: invalidateAuth(invalidateOptions),
  });
}

export function useSignInSocialMutation() {
  return useMutation({
    mutationFn: ({
      provider,
      callbackURL,
    }: {
      provider: SupportedSocialProviderId;
      callbackURL: string;
    }) => {
      return authClient.signIn.social({ callbackURL, provider });
    },
  });
}

export function useSignOutMutation(invalidateOptions?: InvalidateOptions) {
  const invalidateAuth = useAuthInvalidate();

  return useMutation({
    mutationFn: signOut,
    onSuccess: invalidateAuth(invalidateOptions),
  });
}
