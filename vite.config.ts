/// <reference types="vitest/config" />
// Skip environment validation for development tools like VS Code extensions
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
if (process.env.SKIP_ENV_VALIDATION !== 'true') {
  import('./src/configs/env');
}

const dirname =
  typeof __dirname === 'undefined'
    ? path.dirname(fileURLToPath(import.meta.url))
    : __dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      customViteReactPlugin: true,
      tsr: {
        quoteStyle: 'single',
        semicolons: true,
      },
    }),
    react(),
  ],
  server: {
    port: 3000,
  },
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'dist/',
        '.output/',
        '.tanstack/',
        'build/',
        'coverage/',
        'playwright-report/',
        'test-results/',
        'storybook-static/',
        // Test files
        'src/test/',
        'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
        // Storybook files
        'src/**/*.stories.{js,ts,jsx,tsx}',
        '.storybook/',
        // Config files
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        // Auto-generated files
        '**/routeTree.gen.ts',
        'src/lib/db/schemas/auth.ts',
        // Build artifacts
        '**/*.{config,setup,spec,test}.{js,ts}',
        // Root level files
        '*.{js,ts,jsx,tsx}',
      ],
      // Only include source code in coverage
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Set coverage thresholds
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
      },
    },
    projects: [
      {
        test: {
          environment: 'jsdom',
          exclude: [
            'node_modules',
            'dist',
            '.next',
            '.vercel',
            'src/stories/**',
            '**/*.stories.@(js|jsx|ts|tsx)',
          ],
          globals: true,
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          name: 'unit',
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [
              {
                browser: 'chromium',
              },
            ],
            provider: 'playwright',
          },
          name: 'storybook',
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
