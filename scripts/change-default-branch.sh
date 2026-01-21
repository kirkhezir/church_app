#!/bin/bash
# Script to change GitHub default branch to main

# This needs to be run manually or via GitHub settings
# You can also use: gh repo edit --default-branch main

echo "To change default branch to 'main':"
echo "1. Go to: https://github.com/kirkhezir/church_app/settings/branches"
echo "2. Under 'Default branch', click the switch icon"
echo "3. Select 'main' from the dropdown"
echo "4. Click 'Update' and confirm"
echo ""
echo "Or use GitHub CLI:"
echo "  gh repo edit kirkhezir/church_app --default-branch main"
