/// <reference types="vinxi/types/client" />
// eslint-disable-next-line simple-import-sort/imports
import { reactScan } from './components/utils/react-scan';
import { StartClient } from '@tanstack/react-start';
import { hydrateRoot } from 'react-dom/client';

import { createRouter } from './router';

reactScan();

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
