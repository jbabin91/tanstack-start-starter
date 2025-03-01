import { logger } from '~/lib/server/logger';

import { $exampleFunction } from '../server';

async function handleAction() {
  logger.info('User initiated action', {
    action: 'handleAction',
    component: 'example-component',
  });

  try {
    const result = await $exampleFunction();
    logger.debug('Action completed', { result });
  } catch (error) {
    logger.error('Action failed', {
      component: 'example-component',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export function ExampleComponent() {
  return (
    <button type="button" onClick={() => void handleAction()}>
      Perform Action
    </button>
  );
}
