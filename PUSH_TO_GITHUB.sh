#!/bin/bash
# Run this script AFTER creating the GitHub repository
# Replace YOUR_USERNAME with your actual GitHub username

GITHUB_USERNAME="YOUR_USERNAME"  # CHANGE THIS!
REPO_NAME="abel-helse-docs"

echo "🚀 Pushing to GitHub..."
echo "Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"

# Add remote (if not already added)
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Ensure we're on main branch
git branch -M main

# Push code
git push -u origin main

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "📝 Next: Enable GitHub Pages"
echo "1. Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: main, Folder: / (root)"
echo "4. Click Save"
echo ""
echo "🌐 Your site will be live at:"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"

