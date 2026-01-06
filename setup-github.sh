#!/bin/bash

# Script to create GitHub repo and push code
# Usage: ./setup-github.sh <repo-name> [github-username]

REPO_NAME=${1:-"abel-helse-docs"}
GITHUB_USER=${2:-""}

echo "🚀 Setting up GitHub repository: $REPO_NAME"

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    gh repo create $REPO_NAME --public --source=. --remote=origin --push
    gh repo view --web
    echo "✅ Repository created and code pushed!"
    echo "📝 Next step: Enable GitHub Pages in Settings > Pages > Source: main branch"
elif [ -n "$GITHUB_USER" ]; then
    echo "📝 GitHub CLI not found. Creating repo via API..."
    echo "Please provide your GitHub Personal Access Token when prompted"
    read -sp "GitHub Token: " GITHUB_TOKEN
    echo ""
    
    # Create repo via API
    curl -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/user/repos \
      -d "{\"name\":\"$REPO_NAME\",\"public\":true,\"description\":\"Abel Helse documentation website\"}"
    
    # Add remote and push
    git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
    git branch -M main
    git push -u origin main
    
    echo "✅ Repository created!"
    echo "🌐 Enable GitHub Pages: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
else
    echo "⚠️  GitHub CLI not found and no username provided"
    echo ""
    echo "Manual setup instructions:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named: $REPO_NAME"
    echo "3. Don't initialize with README (we already have files)"
    echo "4. Run these commands:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "5. Enable GitHub Pages:"
    echo "   - Go to Settings > Pages"
    echo "   - Source: Deploy from a branch"
    echo "   - Branch: main / (root)"
    echo "   - Save"
fi

