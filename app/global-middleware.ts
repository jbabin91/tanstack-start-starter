import { registerGlobalMiddleware } from '@tanstack/react-start';

import { loggingMiddleware } from './lib/server/middleware/logger';

registerGlobalMiddleware({
  middleware: [loggingMiddleware],
});
