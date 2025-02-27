/// <reference types="vinxi/types/client" />
// eslint-disable-next-line simple-import-sort/imports
import { scan } from 'react-scan';
import { StartClient } from '@tanstack/react-start';
import { hydrateRoot } from 'react-dom/client';

import { createRouter } from './router';

scan({
  enabled: import.meta.env.DEV,
});

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
