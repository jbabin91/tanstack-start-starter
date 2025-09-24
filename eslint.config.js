import js from '@eslint/js';
import pluginReact from '@eslint-react/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import configPrettier from 'eslint-config-prettier';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortKeysPlus from 'eslint-plugin-sort-keys-plus';
import storybook from 'eslint-plugin-storybook';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'node_modules',
    'dist',
    'coverage',
    'playwright-report',
    'test-results',
    'storybook-static',
    '**/*.gen.ts',
  ]),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
  },
  ...pluginRouter.configs['flat/recommended'],
  ...pluginQuery.configs['flat/recommended'],
  {
    extends: [js.configs.recommended, unicorn.configs.recommended],
    plugins: {
      'import-x': importX,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      eqeqeq: 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
      'import-x/no-relative-parent-imports': 'error',
      'no-console': 'warn',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: false,
            kebabCase: true,
            pascalCase: false,
          },
          ignore: [String.raw`^\$.*\.tsx?$`], // Allow parameter files starting with $
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/prefer-class-fields': 'error',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    extends: [pluginReact.configs['recommended-type-checked']],
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/no-nested-component-definitions': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-no-constructed-context-values': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
          shorthandLast: false,
        },
      ],
      'react/no-danger': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      'jsx-a11y': {
        components: {
          Button: 'button',
          Input: 'input',
          Select: 'select',
        },
      },
      react: { version: 'detect' },
    },
  },
  {
    files: ['eslint.config.js', 'vite.config.ts'],
    plugins: {
      'sort-keys-plus': sortKeysPlus,
    },
    rules: {
      'sort-keys-plus/sort-keys': [
        'error',
        'asc',
        {
          caseSensitive: false,
          minKeys: 3,
        },
      ],
    },
  },
  {
    files: ['**/*.stories.*'],
    plugins: {
      storybook,
    },
    rules: {
      ...storybook.configs['flat/recommended'].rules,
      '@eslint-react/no-array-index-key': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'unicorn/no-array-reduce': 'off',
    },
  },
  {
    files: ['.storybook/**/*'],
    rules: {
      'import-x/no-relative-parent-imports': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    rules: {
      'better-tailwindcss/enforce-consistent-class-order': 'off',
      'better-tailwindcss/enforce-consistent-important-position': 'off',
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      'better-tailwindcss/enforce-consistent-variable-syntax': 'off',
      'better-tailwindcss/enforce-shorthand-classes': 'warn',
      'better-tailwindcss/no-contradicting-classes': 'off',
      'better-tailwindcss/no-deprecated-classes': 'warn',
      'better-tailwindcss/no-duplicate-classes': 'warn',
      'better-tailwindcss/no-unregistered-classes': 'off',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/app.css',
      },
    },
  },
  {
    files: [
      'src/configs/env.ts',
      'src/lib/db/seed/**/*',
      'src/lib/db/reset.ts',
      'src/lib/logger.ts',
      '**/*.stories.*',
      '**/*.test.*',
      '**/*.spec.*',
      'e2e/**/*',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  configPrettier,
);
