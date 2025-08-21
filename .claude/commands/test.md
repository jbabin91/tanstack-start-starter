---
allowed-tools: Bash(pnpm test:*), Bash(pnpm with-env vitest:*), Bash(playwright test:*), Bash(echo $?)
description: Run comprehensive test suite including unit tests, Storybook tests, and e2e tests
---

## Context

This command runs the complete testing pipeline in the correct order:

1. **Unit tests** - Vitest unit tests for components and utilities
2. **Storybook tests** - Visual component testing with play functions
3. **End-to-end tests** - Playwright browser automation tests

Current project test commands:

- `pnpm test` - Run unit tests (Vitest)
- `pnpm test:storybook` - Run Storybook component tests
- `pnpm test:e2e` - Run Playwright e2e tests
- `pnpm test:all` - Run all Vitest projects (unit + storybook)

## Your task

Run the complete test suite in this specific order:

### Step 1: Unit Tests

```sh
pnpm test
```

This runs Vitest unit tests for components, utilities, and business logic.

### Step 2: Storybook Component Tests

```sh
pnpm test:storybook
```

This runs Storybook component tests with play functions to verify component behavior and accessibility.

### Step 3: End-to-End Tests

```sh
pnpm test:e2e
```

This runs Playwright e2e tests to verify complete user workflows and integration points.

**Important Notes:**

- If any test suite fails, report the specific failures and stop the pipeline
- Unit tests should run quickly and focus on isolated component logic
- Storybook tests verify component interactions and accessibility compliance
- E2E tests validate complete user journeys across the application
- All tests must pass before code is considered ready for deployment

## Expected Output

After successful completion, report:

- ✅ Unit Tests: [X] tests passed, [Y] test suites completed
- ✅ Storybook Tests: [X] stories tested successfully
- ✅ E2E Tests: [X] test scenarios passed across [Y] browsers

If any step fails:

- ❌ Report which test suite failed and specific error details
- 💡 Provide guidance on debugging failed tests
- 🔍 Show failed test names and assertion details

## Test Coverage

The testing pipeline covers:

- **Unit Tests**: Component logic, utilities, hooks, and server functions
- **Component Tests**: UI interactions, accessibility, and visual behavior
- **Integration Tests**: API endpoints, database operations, and auth flows
- **E2E Tests**: Complete user workflows, cross-browser compatibility

## Usage

- `/test` - Run complete test suite (unit + storybook + e2e)
- Use this command before merging code to ensure all functionality works correctly
- Equivalent to the CI/CD test pipeline that runs on pull requests
- For faster feedback during development, run individual test suites as needed

## Debugging Failed Tests

If tests fail:

1. **Unit Test Failures**: Check component logic, mock configurations, and test setup
2. **Storybook Test Failures**: Verify component props, accessibility attributes, and DOM structure
3. **E2E Test Failures**: Check for timing issues, element selectors, and browser compatibility
4. **Flaky Tests**: Re-run individual test files to identify intermittent issues

Use `pnpm test:ui` for interactive unit test debugging and `pnpm test:e2e:ui` for visual e2e test debugging.
