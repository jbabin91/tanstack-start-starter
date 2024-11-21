import { defineConfig } from '@tanstack/start/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  react: {
    babel: {
      plugins: [['babel-plugin-react-compiler', { target: '19' }]],
    },
  },
  routers: {
    api: {
      entry: './app/api.ts',
    },
    client: {
      entry: './app/client.tsx',
    },
    ssr: {
      entry: './app/ssr.tsx',
    },
  },
  server: {
    compatibilityDate: '2024-11-19',
    esbuild: {
      options: {
        target: 'ES2022',
      },
    },
    experimental: { asyncContext: true },
    preset: 'node-server',
  },
  tsr: {
    appDirectory: './app/',
    autoCodeSplitting: true,
    generatedRouteTree: './app/routeTree.gen.ts',
    quoteStyle: 'single',
    routesDirectory: './app/routes/',
    semicolons: true,
  },
  vite: {
    plugins: [tsconfigPaths()],
  },
});
