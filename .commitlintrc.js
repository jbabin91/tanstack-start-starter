import { defineConfig } from 'cz-git';

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  prompt: {
    alias: {
      b: 'chore(repo): bump dependencies',
    },
    allowBreakingChanges: ['feat', 'fix'],
    allowCustomIssuePrefix: false,
    allowEmptyIssuePrefix: false,
    enableMultipleScopes: true,
    maxSubjectLength: 100,
    scopeEnumSeparator: ',',
    skipQuestions: ['footer', 'scope'],
    useEmoji: false,
  },
  rules: {
    'subject-empty': [2, 'never'],
    'subject-min-length': [2, 'always', 2],
  },
});
