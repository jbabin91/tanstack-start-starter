Check if Task Master is installed and install it if needed.

This command helps you get Task Master set up globally on your system.

## Detection and Installation Process

1. **Check Current Installation**

   ```sh
   # Check if task-master command exists
   which task-master || echo "Task Master not found"

   # Check npm global packages
   npm list -g task-master-ai
   ```

2. **System Requirements Check**

   ```sh
   # Verify Node.js is installed
   node --version

   # Verify npm is installed
   npm --version

   # Check Node version (need 16+)
   ```

3. **Install Task Master Globally**
   If not installed, run:

   ```sh
   npm install -g task-master-ai
   ```

4. **Verify Installation**

   ```sh
   # Check version
   task-master --version

   # Verify command is available
   which task-master
   ```

5. **Initial Setup**

   ```sh
   # Initialize in current directory
   task-master init
   ```

6. **Configure AI Provider**
   Ensure you have at least one AI provider API key set:

   ```sh
   # Check current configuration
   task-master models --status

   # If no API keys found, guide setup
   echo "You'll need at least one API key:"
   echo "- ANTHROPIC_API_KEY for Claude"
   echo "- OPENAI_API_KEY for GPT models"
   echo "- PERPLEXITY_API_KEY for research"
   echo ""
   echo "Set them in your shell profile or .env file"
   ```

7. **Quick Test**

   ```sh
   # Create a test PRD
   echo "Build a simple hello world API" > test-prd.txt

   # Try parsing it
   task-master parse-prd test-prd.txt -n 3
   ```

## Troubleshooting

If installation fails:

**Permission Errors:**

```sh
# Try with sudo (macOS/Linux)
sudo npm install -g task-master-ai

# Or fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**Network Issues:**

```sh
# Use different registry
npm install -g task-master-ai --registry https://registry.npmjs.org/
```

**Node Version Issues:**

```sh
# Install Node 18+ via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

## Success Confirmation

Once installed, you should see:

```txt
✅ Task Master v0.16.2 (or higher) installed
✅ Command 'task-master' available globally
✅ AI provider configured
✅ Ready to use slash commands!

Try: /project:task-master:init your-prd.md
```

## Next Steps

After installation:

1. Run `/project:utils:check-health` to verify setup
2. Configure AI providers with `/project:task-master:models`
3. Start using Task Master commands!
