/// <reference types="vinxi/types/client" />
import { StartClient } from '@tanstack/start';
import { hydrateRoot } from 'react-dom/client';

import { createRouter } from '@/router.tsx';

const router = createRouter();

hydrateRoot(document.querySelector('#root')!, <StartClient router={router} />);
