/// <reference types="vinxi/types/server" />
import { getRouterManifest } from '@tanstack/start/router-manifest';
import { createStartHandler, defaultStreamHandler } from '@tanstack/start/server';

import { parseEnv } from '@/configs/env.ts';
import { createRouter } from '@/lib/router.tsx';

parseEnv();

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler);
