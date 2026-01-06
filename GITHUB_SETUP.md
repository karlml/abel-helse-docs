# GitHub Repository Setup Guide

## Quick Setup (if you have GitHub CLI installed)

```bash
gh repo create abel-helse-docs --public --source=. --remote=origin --push
gh repo view --web
```

Then enable GitHub Pages in Settings > Pages.

## Manual Setup

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `abel-helse-docs` (or your preferred name)
3. Description: "Abel Helse documentation website"
4. Set to **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have files)
6. Click "Create repository"

### Step 2: Connect Local Repo to GitHub

Run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/abel-helse-docs.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 4: Access Your Live Website

After a few minutes, your site will be live at:
```
https://YOUR_USERNAME.github.io/abel-helse-docs/
```

## Alternative: Using GitHub Desktop

1. Open GitHub Desktop
2. File > Add Local Repository
3. Select this folder
4. Publish repository
5. Enable GitHub Pages in browser (Settings > Pages)

