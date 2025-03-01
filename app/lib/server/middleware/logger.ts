import { createMiddleware } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { logger } from '../logger';

export const loggingMiddleware = createMiddleware().server(
  async ({ next, data }) => {
    const request = getWebRequest()!;
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // Create a child logger with request context
    const reqLogger = logger.child({
      method: request.method,
      requestId,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    });

    // Log the request
    reqLogger.info({
      data,
      msg: 'Incoming request',
    });

    try {
      // Process the request
      const result = await next();

      // Log the successful response
      reqLogger.info({
        duration: Date.now() - startTime,
        msg: 'Request completed',
        status: 'success',
      });

      return result;
    } catch (error) {
      // Log the error
      reqLogger.error({
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        msg: 'Request failed',
        stack: error instanceof Error ? error.stack : undefined,
        status: 'error',
      });

      throw error;
    }
  },
);
