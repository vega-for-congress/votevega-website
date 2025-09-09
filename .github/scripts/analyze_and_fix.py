#!/usr/bin/env python3
"""
LLM-powered issue analysis and code fix generation script v2.
This script analyzes GitHub issues and generates potential code fixes.
Updated: 2025-09-09 - Fixed model caching issue
"""

import os
import json
import sys
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import requests


class LLMClient:
    """Handles communication with various LLM APIs"""
    
    def __init__(self):
        self.warp_api_key = os.getenv('WARP_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        
    def call_warp_api(self, prompt: str) -> Optional[str]:
        """Call Warp API (placeholder - adjust based on actual Warp API)"""
        if not self.warp_api_key:
            return None
            
        # Note: This is a placeholder implementation
        # Replace with actual Warp API endpoint and format when available
        try:
            headers = {
                'Authorization': f'Bearer {self.warp_api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'prompt': prompt,
                'max_tokens': 4000
            }
            
            # Placeholder URL - replace with actual Warp API endpoint
            response = requests.post(
                'https://api.warp.dev/v1/completions',  # Replace with actual endpoint
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json().get('completion', '')
            else:
                print(f"Warp API error: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error calling Warp API: {e}")
            return None
    
    def call_openai_api(self, prompt: str) -> Optional[str]:
        """Call OpenAI API"""
        if not self.openai_api_key:
            return None
            
        try:
            import openai
            openai.api_key = self.openai_api_key
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful coding assistant that analyzes GitHub issues and proposes code fixes for Hugo-based static websites."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.1
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return None
    
    def call_anthropic_api(self, prompt: str) -> Optional[str]:
        """Call Anthropic Claude API"""
        if not self.anthropic_api_key:
            return None
            
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.anthropic_api_key)
            
            model_name = "claude-3-5-haiku-20241022"
            print(f"Using Anthropic model: {model_name}")
            
            response = client.messages.create(
                model=model_name,
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return response.content[0].text
        except Exception as e:
            print(f"Error calling Anthropic API: {e}")
            return None
    
    def get_llm_response(self, prompt: str) -> Optional[str]:
        """Try to get response from available LLM APIs in order of preference"""
        
        # Try Warp first (as requested by user)
        response = self.call_warp_api(prompt)
        if response:
            print("Using Warp API response")
            return response
            
        # Fallback to Anthropic Claude
        response = self.call_anthropic_api(prompt)
        if response:
            print("Using Anthropic API response")
            return response
            
        # Fallback to OpenAI
        response = self.call_openai_api(prompt)
        if response:
            print("Using OpenAI API response")
            return response
            
        return None


class GitHubIssueAnalyzer:
    """Analyzes GitHub issues and generates code fixes"""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.repo_root = Path.cwd()
        
    def get_repository_context(self) -> str:
        """Gather context about the repository structure and key files"""
        context = []
        
        # Get WARP.md content for project-specific guidance
        warp_file = self.repo_root / 'WARP.md'
        if warp_file.exists():
            context.append("# Project Documentation (WARP.md)")
            context.append(warp_file.read_text()[:2000])  # Limit size
            
        # Get hugo.toml configuration
        hugo_config = self.repo_root / 'hugo.toml'
        if hugo_config.exists():
            context.append("\n# Hugo Configuration (hugo.toml)")
            context.append(hugo_config.read_text()[:1000])
            
        # Get package.json
        package_json = self.repo_root / 'package.json'
        if package_json.exists():
            context.append("\n# Package Configuration (package.json)")
            context.append(package_json.read_text()[:500])
            
        # List key directory structure
        context.append("\n# Repository Structure")
        for item in ['content/', 'layouts/', 'static/', 'archetypes/']:
            if (self.repo_root / item).exists():
                context.append(f"- {item}")
                
        return '\n'.join(context)
    
    def get_relevant_files(self, issue_title: str, issue_body: str) -> List[str]:
        """Identify files that might be relevant to the issue"""
        relevant_files = []
        
        # Common keywords to file mappings for Hugo sites
        keyword_mappings = {
            'css': ['static/css/', 'assets/css/'],
            'style': ['static/css/', 'assets/css/'],
            'styling': ['static/css/', 'assets/css/'],
            'responsive': ['static/css/', 'assets/css/'],
            'mobile': ['static/css/', 'assets/css/'],
            'overflow': ['static/css/', 'assets/css/'],
            'layout': ['layouts/', 'static/css/'],
            'template': ['layouts/'],
            'content': ['content/'],
            'policy': ['content/policy/'],
            'config': ['hugo.toml', 'config.toml'],
            'navigation': ['hugo.toml', 'layouts/partials/'],
            'menu': ['hugo.toml', 'layouts/partials/'],
            'footer': ['layouts/partials/footer.html', 'static/css/'],
            'header': ['layouts/partials/header.html', 'static/css/'],
            'homepage': ['layouts/index.html', 'static/css/'],
            'build': ['package.json', 'netlify.toml']
        }
        
        issue_text = (issue_title + ' ' + issue_body).lower()
        
        for keyword, paths in keyword_mappings.items():
            if keyword in issue_text:
                for path in paths:
                    full_path = self.repo_root / path
                    if full_path.exists():
                        if full_path.is_file():
                            relevant_files.append(str(full_path.relative_to(self.repo_root)))
                        else:
                            # Add files from directory
                            for file_path in full_path.rglob('*'):
                                if file_path.is_file() and file_path.suffix in ['.html', '.css', '.js', '.md', '.toml']:
                                    relevant_files.append(str(file_path.relative_to(self.repo_root)))
        
        # Always include key files
        always_include = ['hugo.toml', 'static/css/style.css']
        for file_path in always_include:
            full_path = self.repo_root / file_path
            if full_path.exists() and str(full_path.relative_to(self.repo_root)) not in relevant_files:
                relevant_files.append(str(full_path.relative_to(self.repo_root)))
                
        # Always include layout files (they're crucial for most issues)
        layouts_dir = self.repo_root / 'layouts'
        if layouts_dir.exists():
            for layout_file in layouts_dir.rglob('*.html'):
                layout_path = str(layout_file.relative_to(self.repo_root))
                if layout_path not in relevant_files:
                    relevant_files.append(layout_path)
                
        return list(set(relevant_files))[:10]  # Limit to 10 files
    
    def read_file_content(self, file_path: str) -> str:
        """Read and return file content with error handling"""
        try:
            full_path = self.repo_root / file_path
            content = full_path.read_text(encoding='utf-8')
            return f"# File: {file_path}\n```\n{content}\n```\n"
        except Exception as e:
            return f"# File: {file_path}\nError reading file: {e}\n"
    
    def create_analysis_prompt(self, issue_title: str, issue_body: str, relevant_files: List[str]) -> str:
        """Create a comprehensive prompt for the LLM"""
        
        repo_context = self.get_repository_context()
        
        file_contents = []
        for file_path in relevant_files:
            file_contents.append(self.read_file_content(file_path))
        
        prompt = f"""You are an expert developer working on a Hugo-based static website for a political campaign. 

# Issue Analysis Request
**Issue Title:** {issue_title}
**Issue Description:** 
{issue_body}

# Repository Context
{repo_context}

# Relevant Files
{''.join(file_contents)}

# Your Task
Analyze this GitHub issue and determine if you can propose a specific code fix. Consider:

1. **Issue Type**: Is this a bug report, feature request, content issue, or styling problem?
2. **Feasibility**: Can this be fixed with code changes, or does it require human judgment?
3. **Hugo Knowledge**: This is a Hugo static site - consider Hugo-specific patterns and best practices
4. **Campaign Website**: This is for Jose Vega's congressional campaign - keep political context in mind

# Response Format
If you can propose a fix, respond with JSON in this exact format:

```json
{{
  "can_fix": true,
  "fix_type": "bug_fix|feature_addition|content_update|style_fix",
  "summary": "Brief description of what you're fixing",
  "files_to_change": [
    {{
      "path": "relative/path/to/file",
      "action": "create|modify",
      "content": "complete new file content OR modified content",
      "description": "what changes are being made to this file"
    }}
  ],
  "explanation": "Detailed explanation of the fix and why this approach was chosen"
}}
```

If you cannot propose a fix, respond with:

```json
{{
  "can_fix": false,
  "reason": "explanation of why this cannot be automatically fixed"
}}
```

Important constraints:
- Only propose changes you're confident about
- Ensure all file paths are correct relative to the repository root
- For Hugo sites, be careful with template syntax and frontmatter
- Test that your proposed changes would not break the build
- Keep the campaign's political messaging and branding in mind
- Don't modify core campaign messaging without explicit instruction
- DO NOT create or modify build artifacts like package-lock.json, node_modules, or public/ directory
- Focus on the actual issue described - if it's about mobile/responsive design, modify CSS or HTML templates
- If it's a styling issue, look at static/css/style.css and layout files in layouts/

Analyze the issue now and provide your response:"""
        
        return prompt
    
    def parse_llm_response(self, response: str) -> Dict:
        """Parse the LLM response and extract JSON"""
        try:
            # Find JSON block in the response
            import re
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                return json.loads(json_str)
            
            # Try to parse the entire response as JSON
            return json.loads(response)
        except Exception as e:
            print(f"Error parsing LLM response: {e}")
            print(f"Response was: {response[:500]}...")
            return {"can_fix": False, "reason": "Failed to parse LLM response"}
    
    def apply_fixes(self, fix_data: Dict) -> bool:
        """Apply the proposed fixes to the repository"""
        if not fix_data.get("can_fix", False):
            return False
            
        try:
            files_changed = 0
            for file_change in fix_data.get("files_to_change", []):
                file_path = self.repo_root / file_change["path"]
                
                # Create directory if it doesn't exist
                file_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Write the new content
                file_path.write_text(file_change["content"], encoding='utf-8')
                files_changed += 1
                print(f"Modified: {file_change['path']}")
                
            print(f"Applied fixes to {files_changed} files")
            return files_changed > 0
            
        except Exception as e:
            print(f"Error applying fixes: {e}")
            return False


def main():
    """Main function to analyze issue and propose fix"""
    
    # Get issue information from environment variables
    issue_number = os.getenv('ISSUE_NUMBER')
    issue_title = os.getenv('ISSUE_TITLE', '')
    issue_body = os.getenv('ISSUE_BODY', '')
    
    if not issue_number:
        print("Error: ISSUE_NUMBER environment variable not set")
        sys.exit(1)
    
    print(f"Analyzing issue #{issue_number}: {issue_title}")
    
    # Initialize analyzer
    analyzer = GitHubIssueAnalyzer()
    
    # Get relevant files
    relevant_files = analyzer.get_relevant_files(issue_title, issue_body)
    print(f"Identified {len(relevant_files)} relevant files: {relevant_files}")
    
    # Create analysis prompt
    prompt = analyzer.create_analysis_prompt(issue_title, issue_body, relevant_files)
    
    # Get LLM response
    response = analyzer.llm_client.get_llm_response(prompt)
    
    if not response:
        print("Error: No response from any LLM service")
        sys.exit(1)
    
    # Parse response
    fix_data = analyzer.parse_llm_response(response)
    
    # Apply fixes if possible
    if fix_data.get("can_fix", False):
        print(f"Applying fixes: {fix_data.get('summary', 'No summary provided')}")
        success = analyzer.apply_fixes(fix_data)
        
        if success:
            print("Fixes applied successfully!")
            
            # Save fix summary for later use
            summary_file = Path('.github/fix_summary.json')
            summary_file.write_text(json.dumps(fix_data, indent=2))
        else:
            print("Failed to apply fixes")
            sys.exit(1)
    else:
        print(f"Cannot automatically fix this issue: {fix_data.get('reason', 'Unknown reason')}")
        # This is not an error - some issues just can't be automatically fixed
        

if __name__ == "__main__":
    main()
