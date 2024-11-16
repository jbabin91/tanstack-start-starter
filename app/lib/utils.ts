import { type ClassValue, clsx } from 'clsx';
import { createContext, useContext } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Strict version of `Extract` for literal union types.
 *
 * @see https://github.com/microsoft/TypeScript/issues/31474
 */
export type ExtractUnionStrict<T, U extends T> = Extract<T, U>;

/**
 * Merges multiple TailwindCSS classes with `clsx` and `tailwind-merge`.
 *
 * @param inputs - The classes to merge.
 * @returns Merged classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a React Context with a custom `useContext` hook.
 *
 * @param options - The options for the context.
 * @param [options.defaultValue=null] - The default value for the context.
 * @param [options.errorMessage='useContext must be used within a Provider'] - The error message to throw when the context is `null`.
 * @returns
 */
export function createContextFactory<ContextData>(options?: {
  defaultValue?: ContextData | null;
  errorMessage?: string;
}) {
  const opts = {
    defaultValue: null,
    errorMessage: 'useContext must be used within a Provider',
    ...options,
  };

  const context = createContext<ContextData | null>(opts.defaultValue);

  function useContextFactory(): ContextData {
    const contextValue = useContext(context);
    if (contextValue === null) {
      throw new Error(opts.errorMessage);
    }
    return contextValue;
  }

  return [context.Provider, useContextFactory] as const;
}

type TryCatchResult<E = Error, T = unknown> = [null, T] | [E, null];

/**
 * Executes a sync function, returning an error or result.
 *
 * @template E - Error type, defaults to `Error`.
 * @template T - Result type.
 * @param fn - The function to execute.
 * @returns `[null, T]` if successful, `[E, null]` if error.
 */
export function tryCatchSync<E = Error, T = unknown>(fn: () => T): TryCatchResult<E, T> {
  try {
    const data = fn();
    return [null, data];
  } catch (error) {
    return [error as E, null];
  }
}

/**
 * Executes an async function, returning a promise with an error or result.
 *
 * @template E - Error type, defaults to `Error`.
 * @template T - Result type.
 * @param promise - The async function to execute.
 * @returns A promise resolving to `[null, T]` if successful, `[E, null]` if error.
 */
export async function tryCatchAsync<E = Error, T = unknown>(
  promise: Promise<T>,
): Promise<TryCatchResult<E, T>> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error as E, null];
  }
}

type ErrorUnion<T extends (new (...args: any[]) => any)[]> = T extends (new (
  ...args: any[]
) => infer U)[]
  ? U
  : never;

/**
 * Executes a sync function, catching specified errors, and returning an error or result.
 *
 * @template E - Error classes to catch.
 * @template T - Result type.
 * @param fn - The function to execute.
 * @param errorClasses - Optional array of error classes.
 * @returns `[null, T]` if successful, `[ErrorUnion<E>, null]` if error.
 * @throws Rethrows errors not in specified classes.
 */
export function tryCatchErrorsSync<E extends (new (...args: any[]) => any)[], T>(
  fn: () => T,
  errorClasses?: E,
): TryCatchResult<ErrorUnion<E>, T> {
  try {
    const data = fn();
    return [null, data];
  } catch (error) {
    if (errorClasses?.some((e) => error instanceof e)) {
      return [error as ErrorUnion<E>, null];
    } else {
      throw error;
    }
  }
}

/**
 * Executes an async function, catching specified errors, and returns a promise with an error or result.
 *
 * @template E - Error classes to catch.
 * @template T - Result type.
 * @param promise - The async function to execute.
 * @param errorClasses - Optional array of error classes.
 * @returns A promise resolving to `[null, T]` if successful, `[ErrorUnion<E>, null]` if error.
 * @throws Rethrows errors not in specified classes.
 */
export async function tryCatchErrorsAsync<E extends (new (...args: any[]) => any)[], T>(
  promise: Promise<T>,
  errorClasses?: E,
): Promise<TryCatchResult<ErrorUnion<E>, T>> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    if (errorClasses?.some((e) => error instanceof e)) {
      return [error as ErrorUnion<E>, null];
    } else {
      throw error;
    }
  }
}
