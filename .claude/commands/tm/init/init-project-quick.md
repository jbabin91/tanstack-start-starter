Quick initialization with auto-confirmation.

Arguments: $ARGUMENTS

Initialize a Task Master project without prompts, accepting all defaults.

## Quick Setup

```sh
task-master init -y
```

## What It Does

1. Creates `.taskmaster/` directory structure
2. Initializes empty `tasks.json`
3. Sets up default configuration
4. Uses directory name as project name
5. Skips all confirmation prompts

## Smart Defaults

- Project name: Current directory name
- Description: "Task Master Project"
- Model config: Existing environment vars
- Task structure: Standard format

## Next Steps

After quick init:

1. Configure AI models if needed:

   ```txt
   /project:tm/models/setup
   ```

2. Parse PRD if available:

   ```txt
   /project:tm/parse-prd <file>
   ```

3. Or create first task:

   ```txt
   /project:tm/add-task create initial setup
   ```

Perfect for rapid project setup!
