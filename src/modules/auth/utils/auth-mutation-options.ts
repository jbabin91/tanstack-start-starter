import {
  mutationOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import { authLogger } from '@/lib/logger';

/**
 * Helper function to create standardized auth mutation options with type inference
 * Handles consistent logging and provides type safety for auth operations
 * Uses better-auth's built-in type system for maximum type safety
 */
export function createAuthMutationOptions<
  TFn extends (...args: any[]) => Promise<any>,
>(config: {
  mutationFn: TFn;
  mutationKey?: string[];
  onSuccess?: (
    data: Awaited<ReturnType<TFn>>,
    variables: Parameters<TFn>[0],
  ) => void | Promise<void>;
  onError?: (
    error: Error,
    variables: Parameters<TFn>[0],
  ) => void | Promise<void>;
}): UseMutationOptions<Awaited<ReturnType<TFn>>, Error, Parameters<TFn>[0]> {
  return mutationOptions({
    ...(config.mutationKey && { mutationKey: config.mutationKey }),
    mutationFn: config.mutationFn,
    onSuccess: async (data, variables) => {
      // Hook-level success logic (logging, etc.)
      if (config.mutationKey) {
        authLogger.info(
          { mutationKey: config.mutationKey },
          'Auth mutation completed successfully',
        );
      }

      // Call custom onSuccess if provided
      await config.onSuccess?.(data, variables);
    },
    onError: async (error, variables) => {
      // Hook-level error logic (logging)
      authLogger.error(
        {
          err: error,
          mutationKey: config.mutationKey,
          variables: typeof variables === 'object' ? variables : undefined,
        },
        'Auth mutation failed',
      );

      // Call custom onError if provided
      await config.onError?.(error, variables);
    },
  });
}
