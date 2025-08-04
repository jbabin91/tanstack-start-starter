# GitHub Repository Ingest Command

## Context

- Current working directory: Analyze the provided GitHub repository using GitIngest service
- Available tools: WebFetch for API calls, file operations for local storage

## Your task

Ingest and analyze a GitHub repository using the GitIngest service based on the provided URL.

### Usage Examples

- `/ingest https://github.com/user/repo` - Analyze the main branch
- `/ingest https://github.com/user/repo/tree/branch-name` - Analyze specific branch
- `/ingest https://github.com/user/repo --save analysis.md` - Save analysis to file

### Process Flow

1. **Validate URL**: Ensure it's a valid GitHub repository URL
2. **Fetch Repository**: Use GitIngest API to convert repo to AI-friendly format
3. **Process Content**: Parse the structured output (summary, structure, files)
4. **Analysis**: Provide insights on:
   - Repository structure and organization
   - Technology stack and dependencies
   - Code patterns and architecture
   - Key files and components
   - Potential integration points or learnings

### GitIngest Integration

Use the GitIngest service API:

- **Base URL**: `https://gitingest.com/api/ingest`
- **Method**: POST with JSON payload `{"url": "github-repo-url"}`
- **Response**: Structured text with repo summary, directory tree, and file contents

### Output Format

Provide a comprehensive analysis including:

1. **Repository Overview**
   - Name, description, primary language
   - Repository statistics (files, size, etc.)
2. **Architecture Analysis**
   - Project structure breakdown
   - Key directories and their purposes
   - Configuration files and build setup
3. **Technology Stack**
   - Languages, frameworks, and libraries used
   - Dependencies and package managers
4. **Key Insights**
   - Notable patterns or approaches
   - Potential learnings for current project
   - Integration opportunities

### Error Handling

- Handle private repositories (may require authentication)
- Manage rate limits and API errors
- Provide fallback for unsupported repositories
- Validate GitHub URLs before processing

### Optional Features

- `--save <filename>` - Save analysis to markdown file
- `--filter <extensions>` - Focus on specific file types
- `--branch <name>` - Analyze specific branch
- `--summary` - Provide condensed analysis only
