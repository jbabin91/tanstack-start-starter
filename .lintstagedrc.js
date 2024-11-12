export default {
  // Type check TypeScript files
  '*.(ts|tsx)': () => 'pnpm typecheck',
  // Lint files
  '*.(ts|tsx|js|jsx)': () => 'pnpm lint',
  // Format files
  '*.(ts|tsx|js|jsx|cjs|mjs|json|md|mdx)': () => 'pnpm format:check',
};
