import { createServerFn } from '@tanstack/react-start';

import { logger } from '~/lib/server/logger';

// This function will automatically be logged by the middleware
export const $exampleFunction = createServerFn().handler(async ({ data }) => {
  // You can also use the logger directly for additional logging
  logger.debug('Processing data in example function', { data });

  try {
    // Your business logic here
    const result = await processData(data);

    // Log successful operations
    logger.info('Data processed successfully', {
      operation: 'processData',
      resultSize: result.length,
    });

    return result;
  } catch (error) {
    // Log errors with context
    logger.error('Failed to process data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'processData',
    });
    throw error;
  }
});

async function processData(_data: unknown) {
  // Simulated processing with delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return ['processed', 'data'];
}
