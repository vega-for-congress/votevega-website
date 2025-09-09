#!/usr/bin/env python3
"""
Script to summarize the changes made by the LLM for PR descriptions.
"""

import json
import sys
from pathlib import Path


def main():
    """Read the fix summary and generate a markdown description"""
    
    summary_file = Path('.github/fix_summary.json')
    
    if not summary_file.exists():
        print("No automated changes were made.")
        return
    
    try:
        with open(summary_file, 'r') as f:
            fix_data = json.load(f)
        
        if not fix_data.get('can_fix', False):
            print("Analysis completed but no fixes were applied.")
            return
        
        print(f"**Fix Type:** {fix_data.get('fix_type', 'Unknown')}")
        print(f"**Summary:** {fix_data.get('summary', 'No summary provided')}")
        print()
        print("**Files Modified:**")
        
        for file_change in fix_data.get('files_to_change', []):
            action = file_change.get('action', 'modified').title()
            path = file_change.get('path', 'unknown')
            description = file_change.get('description', 'No description provided')
            
            print(f"- **{action}** `{path}`: {description}")
        
        if fix_data.get('explanation'):
            print()
            print("**Technical Details:**")
            print(fix_data['explanation'])
            
    except Exception as e:
        print(f"Error reading fix summary: {e}")


if __name__ == "__main__":
    main()
