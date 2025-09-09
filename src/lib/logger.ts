import pino, { type Logger } from 'pino';

import { nanoid } from '@/lib/nanoid';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Configure base logger with production-ready defaults
const baseOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  // Disable logging in test environment unless explicitly enabled
  enabled: !isTest || process.env.ENABLE_TEST_LOGS === 'true',
  // Add custom serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  // Format timestamps for better readability
  timestamp: pino.stdTimeFunctions.isoTime,
  // Add service metadata
  base: {
    service: 'tanstack-start-app',
    env: process.env.NODE_ENV,
    ...(process.env.VERCEL_ENV && { vercelEnv: process.env.VERCEL_ENV }),
    ...(process.env.VERCEL_REGION && { region: process.env.VERCEL_REGION }),
  },
  // Custom error handler for uncaught exceptions
  ...(isDev && {
    formatters: {
      level: (label) => ({ level: label }),
    },
  }),
};

// Configure transport for development (server-side only)
const devTransport: pino.TransportSingleOptions = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    levelFirst: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname,service,env',
    messageFormat: '{msg}',
    errorLikeObjectKeys: ['err', 'error'],
    singleLine: false,
  },
};

// Configure transport for production (structured JSON logs)
const prodTransport = undefined; // Use default stdout for production

// Check if we're in a browser environment
const isBrowser = globalThis.window !== undefined;

// Browser-specific logger configuration
const browserOptions: pino.LoggerOptions = {
  ...baseOptions,
  // Use browser-friendly configuration
  browser: {
    asObject: isDev, // Pretty objects in dev, strings in prod
    write: (() => {
      // Configuration for console methods with emojis
      const consoleMethods = {
        info: { emoji: '🔵', method: console.info },
        warn: { emoji: '🟡', method: console.warn },
        error: { emoji: '🔴', method: console.error },
        debug: { emoji: '🟢', method: console.debug },
        trace: { emoji: '🔍', method: console.trace },
        fatal: { emoji: '💀', method: console.error },
      } as const;

      // Generate write handlers dynamically
      return Object.fromEntries(
        Object.entries(consoleMethods).map(([level, { emoji, method }]) => [
          level,
          (o: unknown) => {
            if (isDev) {
              method(emoji, o);
            } else {
              method(o);
            }
          },
        ]),
      );
    })(),
  },
};

// Create the base logger instance
export const logger: Logger = isBrowser
  ? pino(browserOptions)
  : pino(
      baseOptions,
      // Only use transport in Node.js environment (server-side)
      isDev && !isTest ? pino.transport(devTransport) : prodTransport,
    );

// Request context storage using AsyncLocalStorage (Node.js) or global (browser)
type RequestContext = {
  requestId: string;
  userId?: string;
  startTime: number;
};

// Use AsyncLocalStorage for proper request isolation in Node.js
let requestContextStore: {
  getStore(): RequestContext | undefined;
  run<T>(context: RequestContext, fn: () => T): T;
} | null = null;

// Initialize AsyncLocalStorage only in Node.js environments
if (typeof process !== 'undefined' && !isBrowser) {
  void import('node:async_hooks')
    .then(({ AsyncLocalStorage }) => {
      requestContextStore = new AsyncLocalStorage();
    })
    // eslint-disable-next-line unicorn/prefer-top-level-await
    .catch(() => {
      // Fallback if AsyncLocalStorage is not available
      requestContextStore = null;
    });
}

// Browser fallback - simple global context (single-threaded)
let browserRequestContext: RequestContext | null = null;

/**
 * Creates a new request context with automatic ID generation using nanoid.
 *
 * @param userId - Optional user ID to associate with this request context
 * @returns RequestContext object with requestId, userId, and startTime
 *
 * @example
 * ```typescript
 * // Create context for anonymous request
 * const context = createRequestContext();
 *
 * // Create context for authenticated user
 * const userContext = createRequestContext(session.user.id);
 * ```
 */
export function createRequestContext(userId?: string): RequestContext {
  return {
    requestId: `req_${nanoid(8)}`,
    userId,
    startTime: Date.now(),
  };
}

/**
 * Gets the current request context if available.
 * Uses AsyncLocalStorage in Node.js and global variable in browser.
 *
 * @returns Current RequestContext or null if not available
 *
 * @example
 * ```typescript
 * const context = getCurrentRequestContext();
 * if (context) {
 *   console.log(`Processing request ${context.requestId}`);
 * }
 * ```
 */
export function getCurrentRequestContext(): RequestContext | null {
  if (isBrowser) {
    return browserRequestContext;
  }
  return requestContextStore?.getStore() ?? null;
}

// Type for log objects to improve type safety
type LogObject = Record<string, unknown>;

// Performance optimization: Unified context caching
type ContextCache = {
  context: RequestContext | null;
  timestamp: number;
  contextObject: LogObject;
};

let contextCache: ContextCache | null = null;
const CONTEXT_CACHE_TTL = 100; // ms - Cache for short duration to reduce lookup overhead

// Unified context management with caching
function getContextObject(
  additionalContext?: RequestContext | null,
): LogObject {
  // Use provided context directly
  if (additionalContext) {
    return {
      requestId: additionalContext.requestId,
      ...(additionalContext.userId && { userId: additionalContext.userId }),
    };
  }

  // Check cache first
  const now = Date.now();
  if (contextCache && now - contextCache.timestamp < CONTEXT_CACHE_TTL) {
    return contextCache.contextObject;
  }

  // Cache miss - get fresh context and cache it
  const context = getCurrentRequestContext();
  const contextObject = context
    ? {
        requestId: context.requestId,
        ...(context.userId && { userId: context.userId }),
      }
    : {};

  contextCache = {
    context,
    timestamp: now,
    contextObject,
  };

  return contextObject;
}

// Environment context types
type BrowserContext = {
  userAgent?: string;
  url?: string;
  timestamp: string;
};

type ServerContext = {
  pid?: number;
  nodeVersion?: string;
  platform?: string;
  memory?: NodeJS.MemoryUsage;
};

type EnvironmentContext = BrowserContext | ServerContext;

// Helper to get environment-specific context
function getEnvironmentContext(): EnvironmentContext {
  return isBrowser
    ? {
        userAgent: navigator?.userAgent,
        url: globalThis?.location?.href,
        timestamp: new Date().toISOString(),
      }
    : {
        pid: process?.pid,
        nodeVersion: process?.version,
        platform: process?.platform,
        memory: process?.memoryUsage?.(),
      };
}

function createLogMethod(
  baseLogger: Logger,
  method: LogLevel,
  context?: RequestContext | null,
  isContextAware = false,
  sampleRate?: number,
) {
  return function (messageOrObj: string | LogObject, message?: string): void {
    // Handle sampling for non-error logs
    const shouldSample =
      !sampleRate ||
      method === 'error' ||
      method === 'fatal' ||
      Math.random() < sampleRate;

    if (!shouldSample) {
      return; // Skip logging due to sampling
    }

    const contextObj = getContextObject(context);
    let logObj: LogObject;
    let finalMessage: string | undefined;

    if (typeof messageOrObj === 'string') {
      logObj = { ...contextObj };
      finalMessage = messageOrObj;
    } else {
      logObj = { ...messageOrObj, ...contextObj };
      finalMessage = message;
    }

    // Add sampling indicator if applicable
    if (sampleRate && method !== 'error' && method !== 'fatal') {
      logObj = { ...logObj, sampled: true };
    }

    // Add environment-aware context for error logging
    if (isContextAware && (method === 'error' || method === 'fatal')) {
      logObj = {
        ...logObj,
        ...getEnvironmentContext(),
      };
    }

    const logMethod = baseLogger[method].bind(baseLogger);
    logMethod(logObj, finalMessage);
  };
}

// Unified timing method factory with optional sampling
function createTimingMethods(
  baseLogger: Logger,
  context?: RequestContext | null,
  sampleRate?: number,
) {
  const createTimingLogic = (
    operation: string,
    threshold: number,
    contextObj: Record<string, unknown>,
    isSampled: boolean,
  ) => {
    const logObj = {
      operation,
      ...(isSampled && { sampled: true }),
      ...contextObj,
    };

    const operationLabel = isSampled ? `${operation} (sampled)` : operation;

    return {
      logStart: () => baseLogger.debug(logObj, `Starting ${operationLabel}`),
      logComplete: (duration: number) => {
        const level = duration > threshold ? 'warn' : 'debug';
        baseLogger[level](
          { ...logObj, duration, durationMs: duration, threshold },
          `${operationLabel} completed in ${duration}ms`,
        );
      },
      logError: (duration: number, error: unknown) => {
        baseLogger.error(
          { ...logObj, duration, durationMs: duration, threshold, err: error },
          `${operationLabel} failed after ${duration}ms`,
        );
      },
    };
  };

  const shouldSample = () => !sampleRate || Math.random() < sampleRate;
  const isSampled = !!sampleRate;

  return {
    // Synchronous timing method - arrow function to prevent 'this' binding issues
    timed: <T>(operation: string, fn: () => T, threshold = 1000): T => {
      const shouldLog = shouldSample();

      if (!shouldLog && sampleRate) {
        return fn(); // Skip logging for sampling, just run function
      }

      const start = Date.now();
      const contextObj = getContextObject(context);
      const { logStart, logComplete, logError } = createTimingLogic(
        operation,
        threshold,
        contextObj,
        isSampled,
      );

      if (shouldLog) logStart();
      try {
        const result = fn();
        if (shouldLog) logComplete(Date.now() - start);
        return result;
      } catch (error) {
        // Always log errors, even with sampling
        logError(Date.now() - start, error);
        throw error;
      }
    },

    // Asynchronous timing method - arrow function to prevent 'this' binding issues
    timedAsync: async <T>(
      operation: string,
      fn: () => Promise<T>,
      threshold = 1000,
    ): Promise<T> => {
      const shouldLog = shouldSample();

      if (!shouldLog && sampleRate) {
        return await fn(); // Skip logging for sampling, just run function
      }

      const start = Date.now();
      const contextObj = getContextObject(context);
      const { logStart, logComplete, logError } = createTimingLogic(
        operation,
        threshold,
        contextObj,
        isSampled,
      );

      if (shouldLog) logStart();
      try {
        const result = await fn();
        if (shouldLog) logComplete(Date.now() - start);
        return result;
      } catch (error) {
        // Always log errors, even with sampling
        logError(Date.now() - start, error);
        throw error;
      }
    },
  };
}

/**
 * Executes a synchronous function within a specific request context.
 * All logger calls within the function will automatically include the request context.
 *
 * @param context - RequestContext to use during execution
 * @param fn - Synchronous function to execute
 * @returns Result of the executed function
 *
 * @example
 * ```typescript
 * const context = createRequestContext(userId);
 * const result = runWithRequestContext(context, () => {
 *   // All logs in this scope include requestId and userId
 *   apiLogger.info('Processing request');
 *   return processData();
 * });
 * ```
 */
export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => T,
): T {
  if (isBrowser) {
    const previous = browserRequestContext;
    browserRequestContext = context;
    try {
      return fn();
    } finally {
      browserRequestContext = previous;
    }
  }

  if (requestContextStore) {
    return requestContextStore.run(context, fn);
  }

  // Fallback if AsyncLocalStorage is not available
  return fn();
}

/**
 * Executes an asynchronous function within a specific request context.
 * All logger calls within the function will automatically include the request context.
 *
 * @param context - RequestContext to use during execution
 * @param fn - Async function to execute
 * @returns Promise resolving to result of the executed function
 *
 * @example
 * ```typescript
 * const context = createRequestContext(userId);
 * const result = await runWithRequestContextAsync(context, async () => {
 *   // All logs in this scope include requestId and userId
 *   apiLogger.info('Starting async operation');
 *
 *   const data = await apiLogger.timedAsync('fetch-data', async () => {
 *     return await fetchUserData();
 *   });
 *
 *   apiLogger.info('Operation completed');
 *   return data;
 * });
 * ```
 */
export async function runWithRequestContextAsync<T>(
  context: RequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  if (isBrowser) {
    const previous = browserRequestContext;
    browserRequestContext = context;
    try {
      return await fn();
    } finally {
      browserRequestContext = previous;
    }
  }

  if (requestContextStore) {
    return await requestContextStore.run(context, fn);
  }

  // Fallback if AsyncLocalStorage is not available
  return await fn();
}

// Helper type for log methods with overloads
type LogMethod = (messageOrObj: string | LogObject, message?: string) => void;

// Configuration type for the unified logger factory
type LoggerConfig = {
  module: string;
  context?: RequestContext;
  sampleRate?: number;
  isContextAware?: boolean;
};

// Log level type for better type safety
type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'trace' | 'fatal';

/**
 * Smart logger that automatically includes request context and performance timing.
 * Extends Pino logger with enhanced functionality for TanStack Start applications.
 */
type SmartLogger = {
  /** Log informational messages with automatic request context */
  info: LogMethod;
  /** Log error messages with automatic request context */
  error: LogMethod;
  /** Log warning messages with automatic request context */
  warn: LogMethod;
  /** Log debug messages with automatic request context */
  debug: LogMethod;
  /** Log trace messages with automatic request context */
  trace: LogMethod;
  /** Log fatal messages with automatic request context */
  fatal: LogMethod;

  /**
   * Execute a synchronous function with automatic performance timing and logging.
   * Logs at 'debug' level if duration < threshold, 'warn' level if >= threshold.
   *
   * @param operation - Name of the operation being timed
   * @param fn - Function to execute and time
   * @param threshold - Duration in ms above which to log as warning (default: 1000)
   * @returns Result of the executed function
   *
   * @example
   * ```typescript
   * const result = apiLogger.timed('user-fetch', () => {
   *   return fetchUserData(userId);
   * });
   *
   * // Custom threshold (log as warning if > 500ms)
   * const result = apiLogger.timed('fast-operation', () => doWork(), 500);
   * ```
   */
  timed<T>(operation: string, fn: () => T, threshold?: number): T;

  /**
   * Execute an asynchronous function with automatic performance timing and logging.
   * Logs at 'debug' level if duration < threshold, 'warn' level if >= threshold.
   *
   * @param operation - Name of the operation being timed
   * @param fn - Async function to execute and time
   * @param threshold - Duration in ms above which to log as warning (default: 1000)
   * @returns Promise resolving to result of the executed function
   *
   * @example
   * ```typescript
   * const result = await apiLogger.timedAsync('database-query', async () => {
   *   return await db.users.findMany();
   * });
   *
   * // Custom threshold (log as warning if > 2000ms)
   * const result = await apiLogger.timedAsync('slow-operation', async () => {
   *   return await heavyComputation();
   * }, 2000);
   * ```
   */
  timedAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    threshold?: number,
  ): Promise<T>;

  /**
   * Create a request-scoped child logger with automatic request context.
   * Useful for tracking all logs within a specific request.
   *
   * @param userId - Optional user ID to include in all logs
   * @returns New SmartLogger instance with request context
   *
   * @example
   * ```typescript
   * // In server function
   * const requestLogger = apiLogger.forRequest(session.user.id);
   * requestLogger.info('Processing user request'); // Includes requestId and userId
   *
   * const result = await requestLogger.timedAsync('process-request', async () => {
   *   // All logs in this scope include the same request context
   *   return await processUserRequest();
   * });
   * ```
   */
  forRequest(userId?: string): SmartLogger;

  /**
   * Create a sampled version of this logger for high-volume scenarios.
   * Reduces log volume while preserving errors and critical information.
   *
   * @param rate - Sampling rate between 0 and 1 (e.g., 0.1 = 10% of logs)
   * @returns New SmartLogger instance that samples non-error logs
   *
   * @example
   * ```typescript
   * // Log only 10% of debug/info messages, but always log errors
   * const sampledLogger = apiLogger.sample(0.1);
   *
   * // In high-volume endpoint
   * sampledLogger.info('Request processed'); // Only logged 10% of the time
   * sampledLogger.error(err, 'Request failed'); // Always logged
   *
   * // Performance timing also respects sampling
   * await sampledLogger.timedAsync('operation', async () => {
   *   // Timing only logged 10% of the time (unless it errors)
   * });
   * ```
   */
  sample(rate: number): SmartLogger;
} & Logger;

/**
 * Unified factory function for creating Smart Loggers with various configurations.
 * This consolidates all logger creation patterns into a single, configurable function.
 *
 * @param config - Configuration object for logger creation
 * @returns SmartLogger instance with specified configuration
 */
function createSmartLogger(config: LoggerConfig): SmartLogger {
  const { module, context, sampleRate, isContextAware = isBrowser } = config;

  // Create base logger with appropriate metadata
  const baseLogger = context
    ? logger.child({
        module,
        requestId: context.requestId,
        ...(context.userId && { userId: context.userId }),
        ...(sampleRate && { sampleRate }),
      })
    : logger.child({
        module,
        ...(sampleRate && { sampleRate }),
      });

  // Create all log methods using unified factory
  const logMethods = {} as Record<LogLevel, LogMethod>;
  for (const method of [
    'info',
    'error',
    'warn',
    'debug',
    'trace',
    'fatal',
  ] as const) {
    logMethods[method] = createLogMethod(
      baseLogger,
      method,
      context,
      isContextAware,
      sampleRate,
    );
  }

  // Create timing methods using unified factory
  const timingMethods = createTimingMethods(baseLogger, context, sampleRate);

  return {
    ...baseLogger,
    ...logMethods,

    timed: timingMethods.timed,

    timedAsync: timingMethods.timedAsync,
    forRequest(userId?: string): SmartLogger {
      const requestContext = createRequestContext(userId);
      return createSmartLogger({
        ...config,
        context: requestContext,
      });
    },
    sample(rate: number): SmartLogger {
      return createSmartLogger({
        ...config,
        sampleRate: rate,
      });
    },
  } as SmartLogger;
}

/**
 * Creates a module-specific logger with automatic environment-aware context.
 * Automatically adds browser context (userAgent, URL, timestamp) in browser environment
 * and server context in Node.js environment for error/fatal logs.
 *
 * @param module - Module name to include in all logs (e.g., 'auth', 'api', 'database', 'ui')
 * @returns SmartLogger instance with module context and environment-appropriate functionality
 *
 * @example
 * ```typescript
 * // Create specialized loggers for different modules
 * const authLogger = createModuleLogger('auth');     // Auto context-aware
 * const dbLogger = createModuleLogger('database');   // Auto context-aware
 * const uiLogger = createModuleLogger('ui');         // Auto context-aware
 * const apiLogger = createModuleLogger('api');       // Auto context-aware
 *
 * // Browser: Automatically adds userAgent, URL, timestamp to error logs
 * // Server: Uses standard server context for error logs
 * authLogger.error(new Error('Login failed'));
 *
 * // Use with performance timing
 * const result = await dbLogger.timedAsync('user-query', async () => {
 *   return await db.users.findFirst({ where: { id: userId } });
 * });
 * ```
 */
export function createModuleLogger(module: string): SmartLogger {
  return createSmartLogger({ module });
}

// Specialized loggers for different concerns with automatic environment detection
export const authLogger = createModuleLogger('auth');
export const dbLogger = createModuleLogger('database');
export const apiLogger = createModuleLogger('api');
export const emailLogger = createModuleLogger('email');
export const uiLogger = createModuleLogger('ui'); // Auto browser-enhanced

// Graceful shutdown handler
if (typeof process !== 'undefined' && process.on) {
  process.on('uncaughtException', (err) => {
    logger.fatal(err, 'Uncaught exception');
    // Synchronously flush the logger
    logger.flush();
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal(
      {
        err: reason instanceof Error ? reason : new Error(String(reason)),
        promise,
      },
      'Unhandled promise rejection',
    );
    // Synchronously flush the logger
    logger.flush();
    process.exit(1);
  });
}

// Export types for use in other modules
export type { Logger } from 'pino';
export type { RequestContext, SmartLogger };
