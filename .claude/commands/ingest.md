# GitHub Repository Ingest Command

## Context

- Use GitIngest CLI tool to convert GitHub repositories into AI-friendly text format
- Available tools: Bash for CLI commands, file operations for saving analysis

## Your task

Ingest and analyze a GitHub repository using the GitIngest CLI tool, then provide comprehensive analysis.

### Usage Examples

- `/ingest https://github.com/user/repo` - Analyze the main branch
- `/ingest https://github.com/user/repo --branch feature-branch` - Analyze specific branch
- `/ingest https://github.com/user/repo --save analysis.md` - Save analysis to file
- `/ingest https://github.com/user/repo --filter "*.py,*.js"` - Focus on specific file types

### Process Flow

1. **Install GitIngest** (if not already installed): `pipx install gitingest`
2. **Validate URL**: Ensure it's a valid GitHub repository URL
3. **Run GitIngest CLI**: Use `gitingest <url> -o -` to stream output
4. **Parse Structured Output**: Process the three sections:
   - Repository Summary (metadata, file count, token estimate)
   - Directory Structure (hierarchical tree view)
   - File Contents (delimited code blocks)
5. **Provide Analysis**: Generate insights and recommendations

### GitIngest CLI Integration

**Basic Command**:

```sh
gitingest https://github.com/user/repo -o -
```

**Advanced Options**:

- `-i "*.py"` - Include only Python files
- `-e "node_modules/*"` - Exclude directories/patterns
- `-s 51200` - Max file size (50KB)
- `-b main` - Specific branch
- `-t $GITHUB_TOKEN` - Private repos
- `-o filename.txt` - Save to file

### Output Format Structure

GitIngest returns structured plain-text with three sections:

1. **Repository Summary**

```sh
Repository: owner/repo-name
Files analyzed: 42
Estimated tokens: 15.2k
```

2. **Directory Structure**

```sh
Directory structure:
└── project-name/
    ├── src/
    │   ├── main.py
    │   └── utils.py
    └── README.md
```

3. **File Contents**

```sh
================================================
FILE: src/main.py
================================================
[file content here]
```

### Analysis Framework

Provide comprehensive analysis covering:

1. **Repository Overview**
   - Extract metadata from summary section
   - Repository size, complexity, primary language
2. **Architecture Analysis**
   - Parse directory structure for patterns
   - Identify key components and organization
   - Configuration files and build setup
3. **Technology Stack**
   - Languages, frameworks, and libraries detected
   - Dependencies and package managers
   - Development tools and workflows
4. **Code Quality & Patterns**
   - Notable patterns or approaches
   - Code organization principles
   - Testing strategies and documentation
5. **Integration Insights**
   - Potential learnings for current project
   - Reusable patterns or components
   - Best practices to adopt

### Error Handling

- Check if GitIngest is installed, install if needed
- Handle private repositories with token requirements
- Manage network errors and timeouts
- Validate GitHub URLs before processing

### Command Arguments

- `--save <filename>` - Save raw output and analysis to markdown file
- `--filter <patterns>` - Comma-separated include patterns (e.g., "_.py,_.js,\*.md")
- `--exclude <patterns>` - Comma-separated exclude patterns
- `--branch <name>` - Analyze specific branch
- `--max-size <bytes>` - Maximum file size to process
- `--summary` - Provide condensed analysis only
