/** @type {import("lint-staged").Config} */
export default {
  // Type check only staged TypeScript files using tsc-files
  '*.(ts|tsx)': (files) => `pnpm tsc-files --noEmit ${files.join(' ')}`,
  // Lint only staged files
  '*.(ts|tsx|js|jsx|cjs|mjs)': (files) =>
    `pnpm eslint ${files.join(' ')} --max-warnings 0 --cache --cache-location node_modules/.cache/eslint/.eslintcache`,
  // Lint markdown files
  '*.(md|mdx)': (files) => `pnpm markdownlint-cli2 ${files.join(' ')}`,
  // Format files
  '*.(ts|tsx|js|jsx|cjs|mjs|json|md|mdx)': (files) =>
    `pnpm prettier -uc ${files.join(' ')}`,
};
