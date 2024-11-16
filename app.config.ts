import { defineConfig } from '@tanstack/start/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  react: {
    babel: {
      plugins: [['babel-plugin-react-compiler', { target: '19' }]],
    },
  },
  server: {
    compatibilityDate: '2024-11-01',
    preset: 'node-server',
  },
  tsr: {
    autoCodeSplitting: true,
    quoteStyle: 'single',
    semicolons: true,
  },
  vite: {
    plugins: [tsconfigPaths()],
  },
});
