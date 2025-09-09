# LLM-Powered Issue to PR Workflow

This directory contains a GitHub Actions workflow that automatically analyzes GitHub issues and proposes code fixes using Large Language Models (LLMs).

## How It Works

1. **Trigger**: When a new issue is opened in the repository
2. **Analysis**: The workflow uses an LLM to analyze the issue and repository context
3. **Fix Generation**: If possible, the LLM proposes specific code changes
4. **Validation**: The proposed changes are validated by running the Hugo build
5. **PR Creation**: If the build passes, a PR is created targeting the `adrian` branch
6. **Notification**: Comments are added to the original issue with status updates

## Setup Requirements

### GitHub Secrets

You need to configure at least one of these API keys in your repository secrets:

#### Option 1: Warp API (Preferred)
- **Secret Name**: `WARP_API_KEY`
- **Description**: API key for Warp AI service
- **Note**: Currently a placeholder - replace with actual Warp API details when available

#### Option 2: Anthropic Claude API
- **Secret Name**: `ANTHROPIC_API_KEY`
- **Description**: API key for Anthropic Claude
- **Get it from**: https://console.anthropic.com/

#### Option 3: OpenAI API
- **Secret Name**: `OPENAI_API_KEY`
- **Description**: API key for OpenAI GPT models
- **Get it from**: https://platform.openai.com/api-keys

### Setting up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the secret name and value
5. Click **Add secret**

### Branch Setup

The workflow automatically creates an `adrian` branch if it doesn't exist. All PRs will target this branch instead of `main`.

## Workflow Files

### `.github/workflows/llm-issue-to-pr.yml`
Main workflow file that:
- Sets up Node.js, Hugo, and Python environments
- Installs necessary dependencies
- Runs the analysis script
- Validates changes with a build test
- Creates PRs and comments on issues

### `.github/scripts/analyze_and_fix.py`
Python script that:
- Communicates with LLM APIs
- Analyzes repository structure and issue content
- Generates code fixes based on LLM suggestions
- Applies changes to the repository

### `.github/scripts/summarize_changes.py`
Helper script that creates formatted descriptions of changes for PR bodies.

## What Issues Can Be Fixed Automatically?

The workflow is designed to handle:

- **CSS/Styling Issues**: Problems with appearance, layout, or responsive design
- **Content Updates**: Typos, formatting issues in markdown files
- **Configuration Problems**: Issues with Hugo configuration or build settings
- **Template Issues**: Problems with Hugo templates and layouts
- **Navigation Issues**: Menu or link problems

The workflow will **NOT** attempt to fix:
- Issues requiring significant design decisions
- Complex feature requests without clear specifications
- Issues that would modify core campaign messaging
- Problems requiring external integrations or services

## Security Considerations

- The workflow only runs on issue creation, not on issue updates
- All changes target the `adrian` branch, not `main`
- The Hugo build must pass before creating a PR
- All proposed changes are reviewed through the PR process
- API keys are stored securely as GitHub secrets

## Testing the Workflow

1. Ensure your API keys are configured
2. Create a test issue describing a simple problem (e.g., "Fix typo in homepage title")
3. Watch the Actions tab to see the workflow run
4. Check for PR creation and issue comments

## Troubleshooting

### No LLM Response
- Verify at least one API key is configured correctly
- Check the Actions logs for API errors
- Ensure you have sufficient API credits/quota

### Build Failures
- The workflow validates changes by running `npm run build`
- If the build fails, no PR will be created
- Check Hugo syntax and file paths in proposed changes

### No Changes Applied
- Some issues cannot be automatically fixed
- The LLM will comment on the issue explaining why
- This is normal behavior for complex or unclear issues

## Customization

To modify the workflow behavior:

1. **Change LLM Prompt**: Edit the `create_analysis_prompt` method in `analyze_and_fix.py`
2. **Add File Type Support**: Update the `keyword_mappings` in the script
3. **Modify Target Branch**: Change `--base adrian` in the workflow file
4. **Adjust Build Validation**: Modify the build step in the workflow

## Monitoring

The workflow provides detailed logging:
- Issue analysis results
- Files identified as relevant
- LLM API responses
- Build validation results
- PR creation status

Check the Actions tab in your repository to monitor workflow runs and troubleshoot issues.
