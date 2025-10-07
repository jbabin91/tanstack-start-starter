/// <reference types="vitest/config" />
/// <reference types="@vitest/browser/providers/playwright" />
// Skip environment validation for development tools like VS Code extensions

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

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['@hookform/resolvers/arktype', 'arktype'],
  },
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      router: {
        quoteStyle: 'single',
        semicolons: true,
      },
    }),
    react(),
  ],
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ['drizzle-orm'],
    external: ['pg'],
  },
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'dist/',
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
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
      },
    },
    hookTimeout: 10_000,
    projects: [
      {
        plugins: [
          tsconfigPaths({
            projects: ['./tsconfig.json'],
          }),
        ],
        test: {
          environment: 'jsdom',
          exclude: [
            'node_modules',
            'dist',
            '.vercel',
            'src/stories/**',
            '**/*.stories.@(js|jsx|ts|tsx)',
            'e2e/**',
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
          tsconfigPaths({
            projects: ['./tsconfig.json'],
          }),
          storybookTest({
            configDir: '.storybook',
          }),
        ],
        test: {
          browser: {
            connectTimeout: 120_000,
            enabled: true,
            headless: true,
            instances: [
              {
                browser: 'chromium',
                context: {
                  locale: 'en-US',
                  timezoneId: 'America/New_York',
                },
                launch: {
                  args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--max_old_space_size=8192',
                    '--memory-pressure-off',
                    '--disable-background-networking',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-breakpad',
                    '--no-first-run',
                    '--disable-default-apps',
                  ],
                },
              },
            ],
            isolate: true,
            provider: 'playwright',
            screenshotFailures: false,
            viewport: {
              width: 1280,
              height: 720,
            },
          },
          maxConcurrency: 2,
          name: 'storybook',
          retry: 2,
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
