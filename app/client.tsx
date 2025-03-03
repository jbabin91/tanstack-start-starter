/// <reference types="vinxi/types/client" />
// eslint-disable-next-line simple-import-sort/imports
import { scan } from 'react-scan';
import { StartClient } from '@tanstack/react-start';
import { hydrateRoot } from 'react-dom/client';

import { createRouter } from './router';

if (!import.meta.env.PROD) {
  scan({
    enabled:
      import.meta.env.DEV && import.meta.env.VITE_ENABLE_REACT_SCAN === 'true',
  });
}

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
