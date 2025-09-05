import pino, { type Logger } from 'pino';

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
    write: {
      /* eslint-disable no-console */
      // Custom write function for better browser formatting
      info: (o: unknown) => {
        if (isDev) {
          console.info('🔵', o);
        } else {
          console.info(o);
        }
      },
      warn: (o: unknown) => {
        if (isDev) {
          console.warn('🟡', o);
        } else {
          console.warn(o);
        }
      },
      error: (o: unknown) => {
        if (isDev) {
          console.error('🔴', o);
        } else {
          console.error(o);
        }
      },
      debug: (o: unknown) => {
        if (isDev) {
          console.debug('🟢', o);
        } else {
          console.debug(o);
        }
      },
      trace: (o: unknown) => {
        if (isDev) {
          console.trace('🔍', o);
        } else {
          console.trace(o);
        }
      },
      fatal: (o: unknown) => {
        if (isDev) {
          console.error('💀', o);
        } else {
          console.error(o);
        }
      },
      /* eslint-enable no-console */
    },
  },
};

// Create the logger instance
export const logger: Logger = isBrowser
  ? pino(browserOptions)
  : pino(
      baseOptions,
      // Only use transport in Node.js environment (server-side)
      isDev && !isTest ? pino.transport(devTransport) : prodTransport,
    );

// Create child loggers for different modules
export const createModuleLogger = (module: string): Logger =>
  logger.child({ module });

// Specialized loggers for different concerns
export const authLogger = createModuleLogger('auth');
export const dbLogger = createModuleLogger('database');
export const apiLogger = createModuleLogger('api');
export const emailLogger = createModuleLogger('email');

// Helper function for consistent error logging
export const logError = (
  error: unknown,
  message: string,
  context?: Record<string, unknown>,
): void => {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  logger.error({ err: errorObj, ...context }, message);
};

// Helper function for performance logging
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>,
): void => {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger[level](
    {
      operation,
      duration,
      durationMs: duration,
      ...metadata,
    },
    `Operation "${operation}" took ${duration}ms`,
  );
};

// Helper for request logging (for server functions)
export const logRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, unknown>,
): void => {
  const level =
    statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[level](
    {
      method,
      path,
      statusCode,
      duration,
      ...metadata,
    },
    `${method} ${path} ${statusCode} ${duration}ms`,
  );
};

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
