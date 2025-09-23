#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console, no-undef */
/**
 * TypeScript type checking for staged files
 * Alternative to tsc-files which has issues with v1.1.3+
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('No files to check');
  process.exit(0);
}

// Filter for TypeScript files
const tsFiles = files.filter(
  (file) => file.endsWith('.ts') || file.endsWith('.tsx'),
);

if (tsFiles.length === 0) {
  console.log('No TypeScript files to check');
  process.exit(0);
}

// Create a temporary tsconfig for just these files
const tempConfig = {
  extends: './tsconfig.json',
  include: tsFiles,
  compilerOptions: {
    noEmit: true,
    skipLibCheck: true,
  },
};

const tempConfigPath = path.join(process.cwd(), '.tsconfig.temp.json');

try {
  // Write temporary config
  fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2));

  // Run TypeScript compiler
  execSync(`npx tsc --project ${tempConfigPath}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('✓ TypeScript check passed');
  process.exit(0);
} catch (error) {
  console.error('✗ TypeScript check failed');
  process.exit(error.status || 1);
} finally {
  // Clean up temp config
  try {
    fs.unlinkSync(tempConfigPath);
  } catch {
    // Ignore cleanup errors
  }
}
