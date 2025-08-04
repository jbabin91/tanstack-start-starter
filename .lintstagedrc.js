/** @type {import("lint-staged").Config} */
export default {
  // Type check TypeScript files
  '*.(ts|tsx)': () => 'pnpm typecheck',
  // Lint files
  '*.(ts|tsx|js|jsx|cjs|mjs)': () => 'pnpm lint',
  // Lint markdown files
  '*.(md|mdx)': (files) => `pnpm markdownlint-cli2 ${files.join(' ')}`,
  // Format files
  '*.(ts|tsx|js|jsx|cjs|mjs|json|md|mdx)': (files) =>
    `pnpm prettier -uc ${files.join(' ')}`,
};
