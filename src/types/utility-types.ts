// ============================================================================
// API Response Types
// ============================================================================

/** Generic API response wrapper with consistent error handling */
export type ApiResponse<TData> =
  | { success: true; data: TData; error?: never }
  | { success: false; data?: never; error: string };

/** Extract data type from ApiResponse */
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never;

// ============================================================================
// Database Types
// ============================================================================

/** Make database timestamps consistent */
export type WithTimestamps<T = object> = T & {
  createdAt: Date;
  updatedAt: Date;
};

/** Make specific fields optional for insert operations */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** Common insert type pattern for entities with auto-generated fields */
export type InsertEntity<T> = OptionalFields<
  T,
  Extract<keyof T, 'id' | 'createdAt' | 'updatedAt'>
>;

// ============================================================================
// Query Types with Better Constraints
// ============================================================================

/** Type-safe query key builder */
export type QueryKeyBuilder<TFeature extends string> = {
  all: () => readonly [TFeature];
  lists: () => readonly [TFeature, 'list'];
  list: (
    filters?: Record<string, unknown>,
  ) => readonly [TFeature, 'list', Record<string, unknown>];
  details: () => readonly [TFeature, 'detail'];
  detail: (id: string) => readonly [TFeature, 'detail', string];
};

// ============================================================================
// Modern TypeScript 5.x Patterns
// ============================================================================

/** Template literal type for activity types */
export type ActivityType = `${string}_${'success' | 'failure' | 'pending'}`;

/** Branded types for better type safety */
export type Brand<T, TBrand> = T & { __brand: TBrand };
export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type PostId = Brand<string, 'PostId'>;

/** Type-safe event emitter */
export type EventMap = Record<string, unknown[]>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T extends unknown[]> = (...args: T) => void;

// ============================================================================
// Validation & Schema Types
// ============================================================================

/** Discriminated union for validation results */
export type ValidationResult<T> =
  | { valid: true; data: T; errors?: never }
  | { valid: false; data?: never; errors: string[] };

/** Type guard creator utility */
export type TypeGuard<T> = (value: unknown) => value is T;

// ============================================================================
// Async Operation Types
// ============================================================================

/** Enhanced Promise type with loading states */
export type AsyncState<T> =
  | { status: 'idle'; data?: never; error?: never }
  | { status: 'loading'; data?: never; error?: never }
  | { status: 'success'; data: T; error?: never }
  | { status: 'error'; data?: never; error: Error };

/** Extract success data from AsyncState */
export type AsyncData<T> = T extends AsyncState<infer U> ? U : never;

// ============================================================================
// Component Props Enhancement
// ============================================================================

/** Extract component props type */
export type ComponentProps<T> =
  T extends React.ComponentType<infer P> ? P : never;

/** Make children optional */
export type WithOptionalChildren<T> = Omit<T, 'children'> & {
  children?: React.ReactNode;
};

/** Polymorphic component props */
export type PolymorphicProps<T extends React.ElementType = React.ElementType> =
  {
    as?: T;
  } & React.ComponentPropsWithoutRef<T>;

// ============================================================================
// Type Guards and Assertions
// ============================================================================

/** Check if value is defined (not null or undefined) */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Type assertion with better error messages */
export function assertType<T>(
  value: unknown,
  predicate: TypeGuard<T>,
  errorMessage: string,
): asserts value is T {
  if (!predicate(value)) {
    throw new Error(errorMessage);
  }
}

/** Exhaustive check for discriminated unions */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}
