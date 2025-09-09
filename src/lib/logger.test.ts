import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use actual nanoid implementation (unmock it)
vi.doUnmock('@/lib/nanoid');

// Mock pino before importing logger
const mockPinoLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  child: vi.fn(),
  flush: vi.fn(),
};

// Mock pino constructor
const mockPino = vi.fn(() => mockPinoLogger);

vi.mock('pino', () => {
  const stdSerializers = {
    err: vi.fn((err) => ({ message: err.message, stack: err.stack })),
    req: vi.fn(),
    res: vi.fn(),
  };

  const stdTimeFunctions = {
    isoTime: vi.fn(() => '2024-01-01T00:00:00.000Z'),
  };

  return {
    default: Object.assign(mockPino, { stdSerializers, stdTimeFunctions }),
    stdSerializers,
    stdTimeFunctions,
    transport: vi.fn(),
  };
});

// Mock process.env for consistent testing
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  vi.clearAllMocks();

  // Reset child logger mock to return itself for chaining
  mockPinoLogger.child.mockReturnValue(mockPinoLogger);
});

describe('Logger', () => {
  describe('Basic Logging Functionality', () => {
    it('should create module loggers with proper configuration', async () => {
      const { createModuleLogger } = await import('./logger');

      const authLogger = createModuleLogger('auth');

      // Verify pino was called with proper configuration
      expect(mockPino).toHaveBeenCalled();

      // Verify child logger was created with module name
      expect(mockPinoLogger.child).toHaveBeenCalledWith(
        expect.objectContaining({ module: 'auth' }),
      );

      // Test basic logging methods exist
      expect(typeof authLogger.info).toBe('function');
      expect(typeof authLogger.error).toBe('function');
      expect(typeof authLogger.warn).toBe('function');
      expect(typeof authLogger.debug).toBe('function');
      expect(typeof authLogger.trace).toBe('function');
      expect(typeof authLogger.fatal).toBe('function');
    });

    it('should log messages with proper context', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');

      // Test string message
      logger.info('Test message');
      expect(mockPinoLogger.info).toHaveBeenCalledWith({}, 'Test message');

      // Test object message
      logger.error({ userId: '123' }, 'Error occurred');
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '123' }),
        'Error occurred',
      );
    });

    it('should handle different log levels', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');

      logger.info('Info message');
      logger.error('Error message');
      logger.warn('Warning message');
      logger.debug('Debug message');
      logger.trace('Trace message');
      logger.fatal('Fatal message');

      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.any(Object),
        'Info message',
      );
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.any(Object),
        'Error message',
      );
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        expect.any(Object),
        'Warning message',
      );
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        expect.any(Object),
        'Debug message',
      );
      expect(mockPinoLogger.trace).toHaveBeenCalledWith(
        expect.any(Object),
        'Trace message',
      );
      expect(mockPinoLogger.fatal).toHaveBeenCalledWith(
        expect.any(Object),
        'Fatal message',
      );
    });
  });

  describe('Timing Methods', () => {
    it('should time synchronous operations', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');

      const result = logger.timed('test-operation', () => {
        return 'success';
      });

      expect(result).toBe('success');

      // Should log start and completion
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'test-operation' }),
        'Starting test-operation',
      );
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test-operation',
          duration: expect.any(Number),
          durationMs: expect.any(Number),
          threshold: 1000,
        }),
        expect.stringContaining('test-operation completed in'),
      );
    });

    it('should time asynchronous operations', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');

      const result = await logger.timedAsync('async-operation', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return 'async-success';
      });

      expect(result).toBe('async-success');

      // Should log start and completion
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'async-operation' }),
        'Starting async-operation',
      );
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'async-operation',
          duration: expect.any(Number),
        }),
        expect.stringContaining('async-operation completed in'),
      );
    });

    it('should log warnings for slow operations', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');

      // Mock Date.now to simulate a slow operation
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T10:00:00Z'));

      const startTime = Date.now();

      // Mock the timing to show 1500ms elapsed
      let callCount = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        callCount++;
        if (callCount === 1) return startTime; // First call (start)
        return startTime + 1500; // Second call (end) - 1500ms later
      });

      logger.timed('slow-operation', () => 'result', 1000);

      // Should log as warning due to exceeding threshold
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'slow-operation',
          duration: 1500,
          durationMs: 1500,
          threshold: 1000,
        }),
        'slow-operation completed in 1500ms',
      );

      vi.useRealTimers();
    });

    it('should handle errors in timed operations', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');

      const error = new Error('Test error');

      expect(() => {
        logger.timed('error-operation', () => {
          throw error;
        });
      }).toThrow('Test error');

      // Should log error with timing info
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'error-operation',
          duration: expect.any(Number),
          err: error,
        }),
        expect.stringContaining('error-operation failed after'),
      );
    });
  });

  describe('Sampling Functionality', () => {
    it('should create sampled logger with appropriate rate', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');
      const sampledLogger = logger.sample(0.1);

      // Should be a valid logger instance
      expect(typeof sampledLogger.info).toBe('function');
      expect(typeof sampledLogger.timed).toBe('function');
      expect(typeof sampledLogger.timedAsync).toBe('function');
    });

    it('should always log errors regardless of sampling', async () => {
      const { createModuleLogger } = await import('./logger');

      // Mock Math.random to always return > sample rate
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.1 sample rate

      const logger = createModuleLogger('test');
      const sampledLogger = logger.sample(0.1);

      // Non-error logs should be sampled out
      sampledLogger.info('This should be sampled out');
      expect(mockPinoLogger.info).not.toHaveBeenCalled();

      // Error logs should always get through
      sampledLogger.error('This error should always log');
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        expect.any(Object),
        'This error should always log',
      );

      vi.restoreAllMocks();
    });

    it('should add sampling indicator to sampled logs', async () => {
      const { createModuleLogger } = await import('./logger');

      // Mock Math.random to always allow sampling
      vi.spyOn(Math, 'random').mockReturnValue(0.05); // < 0.1 sample rate

      const logger = createModuleLogger('test');
      const sampledLogger = logger.sample(0.1);

      sampledLogger.info('Sampled message');

      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ sampled: true }),
        'Sampled message',
      );

      vi.restoreAllMocks();
    });
  });

  describe('Request Context', () => {
    it('should create request context with nanoid', async () => {
      const { createRequestContext } = await import('./logger');

      const context = createRequestContext('user-123');

      expect(context).toEqual({
        requestId: expect.stringMatching(/^req_/),
        userId: 'user-123',
        startTime: expect.any(Number),
      });
    });

    it('should create request context without userId', async () => {
      const { createRequestContext } = await import('./logger');

      const context = createRequestContext();

      expect(context).toEqual({
        requestId: expect.stringMatching(/^req_/),
        userId: undefined,
        startTime: expect.any(Number),
      });
    });

    it('should create request-scoped logger', async () => {
      const { createModuleLogger } = await import('./logger');

      const logger = createModuleLogger('test');
      const requestLogger = logger.forRequest('user-456');

      // Should create child logger with request context
      expect(mockPinoLogger.child).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'test',
          requestId: expect.stringMatching(/^req_/),
          userId: 'user-456',
        }),
      );

      expect(typeof requestLogger.info).toBe('function');
      expect(typeof requestLogger.timed).toBe('function');
    });
  });

  describe('Environment Detection', () => {
    const originalWindow = globalThis.window;
    const originalNavigator = globalThis.navigator;

    afterEach(() => {
      // Restore globals
      globalThis.window = originalWindow;
      globalThis.navigator = originalNavigator;
    });

    it('should detect browser environment', async () => {
      // Mock browser environment
      globalThis.window = {} as any;
      globalThis.navigator = { userAgent: 'test-browser' } as any;

      // Re-import to trigger environment detection
      vi.resetModules();
      const { createModuleLogger } = await import('./logger');

      createModuleLogger('test');

      // In browser, should use browser-specific configuration
      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          browser: expect.objectContaining({
            asObject: expect.any(Boolean),
            write: expect.any(Object),
          }),
        }),
      );
    });

    it('should detect server environment', async () => {
      // Ensure no window object
      delete (globalThis as any).window;
      delete (globalThis as any).navigator;

      // Re-import to trigger environment detection
      vi.resetModules();
      const { createModuleLogger } = await import('./logger');

      createModuleLogger('test');

      // In server environment, should call pino with server config (not browser config)
      expect(mockPino).toHaveBeenCalled();

      // Get the config that was passed to pino
      expect(mockPino.mock.calls.length).toBeGreaterThan(0);
      const pinoConfig = (mockPino.mock.calls as any[])[0][0];
      expect(pinoConfig).not.toHaveProperty('browser');
    });
  });

  describe('Pre-configured Loggers', () => {
    it('should export specialized loggers', async () => {
      const { authLogger, dbLogger, apiLogger, emailLogger, uiLogger } =
        await import('./logger');

      // Test that all loggers exist and have the expected methods
      expect(typeof authLogger.info).toBe('function');
      expect(typeof authLogger.timed).toBe('function');
      expect(typeof authLogger.sample).toBe('function');

      expect(typeof dbLogger.info).toBe('function');
      expect(typeof apiLogger.info).toBe('function');
      expect(typeof emailLogger.info).toBe('function');
      expect(typeof uiLogger.info).toBe('function');

      // Test that they work by calling a method
      authLogger.info('Auth test message');
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        expect.any(Object),
        'Auth test message',
      );
    });
  });

  describe('Context Execution', () => {
    it('should execute functions with request context', async () => {
      const { runWithRequestContext, createRequestContext } = await import(
        './logger'
      );

      const context = createRequestContext('user-789');

      const result = runWithRequestContext(context, () => {
        return 'executed-with-context';
      });

      expect(result).toBe('executed-with-context');
    });

    it('should execute async functions with request context', async () => {
      const { runWithRequestContextAsync, createRequestContext } = await import(
        './logger'
      );

      const context = createRequestContext('user-abc');

      const result = await runWithRequestContextAsync(context, async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return 'async-executed-with-context';
      });

      expect(result).toBe('async-executed-with-context');
    });
  });
});
