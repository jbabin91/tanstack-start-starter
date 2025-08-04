import { defineConfig } from 'cz-git';

export default defineConfig({
  extends: ['@commitlint/config-conventional'],

  // commitlint rules
  rules: {
    // Ensure types match your existing patterns
    'type-enum': [
      2,
      'always',
      [
        'feat', // New features
        'fix', // Bug fixes
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc.)
        'refactor', // Code changes that neither fix bugs nor add features
        'perf', // Performance improvements
        'test', // Adding or correcting tests
        'chore', // Dependencies, tooling, etc.
        'ci', // CI configuration changes
        'revert', // Revert a previous commit
      ],
    ],
    // Scope format - allow optional scopes
    'scope-case': [2, 'always', 'lower-case'],
    // Subject format - imperative mood, no period
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-full-stop': [2, 'never', '.'],
    'subject-empty': [2, 'never'],
    // Header length limit
    'header-max-length': [2, 'always', 72],
  },

  // cz-git configuration
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: "Select the type of change that you're committing:",
      scope: 'Denote the SCOPE of this change (optional):',
      customScope: 'Denote the SCOPE of this change:',
      subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
      body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
      breaking:
        'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
      footerPrefixesSelect:
        'Select the ISSUES type of changeList by this change (optional):',
      customFooterPrefix: 'Input ISSUES prefix:',
      footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
      generatingByAI: 'Generating your AI commit subject...',
      generatedSelectByAI: 'Select suitable subject by AI generated:',
      confirmCommit: 'Are you sure you want to proceed with the commit above?',
    },
    types: [
      { value: 'feat', name: 'feat:     A new feature' },
      { value: 'fix', name: 'fix:      A bug fix' },
      { value: 'docs', name: 'docs:     Documentation only changes' },
      {
        value: 'style',
        name: 'style:    Changes that do not affect the meaning of the code',
      },
      {
        value: 'refactor',
        name: 'refactor: A code change that neither fixes a bug nor adds a feature',
      },
      {
        value: 'perf',
        name: 'perf:     A code change that improves performance',
      },
      {
        value: 'test',
        name: 'test:     Adding missing tests or correcting existing tests',
      },
      {
        value: 'chore',
        name: 'chore:    Changes to the build process or auxiliary tools',
      },
      {
        value: 'ci',
        name: 'ci:       Changes to our CI configuration files and scripts',
      },
      { value: 'revert', name: 'revert:   Revert to a commit' },
    ],
    useEmoji: false, // Set to true if you want emojis in commits
    emojiAlign: 'center',
    useAI: false, // Set to true to enable AI commit suggestions
    aiNumber: 1,
    themeColorCode: '',
    scopes: [
      // Common scopes based on your project structure
      'auth',
      'db',
      'ui',
      'api',
      'hooks',
      'commands',
      'lint',
      'deps',
      'docs',
      'types',
      'config',
      'build',
      'test',
    ],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [
      { value: 'closed', name: 'closed:   ISSUES has been processed' },
    ],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
});
