# 🚀 Quick Start Guide

## ✅ What's Done
- ✅ Git repository initialized
- ✅ Files committed locally
- ✅ Website files ready (index.html)

## 📋 What You Need To Do

### 1. Create GitHub Repository (2 minutes)

**Option A: Via Web Browser (Easiest)**
1. Visit: https://github.com/new
2. Repository name: `abel-helse-docs`
3. Description: `Abel Helse documentation website`
4. Set to **Public** ✅
5. **DO NOT** check "Add a README file"
6. Click **"Create repository"**

**Option B: Via GitHub CLI (if installed)**
```bash
gh repo create abel-helse-docs --public --source=. --remote=origin --push
```

### 2. Push Your Code

**Edit the script first:**
```bash
# Open PUSH_TO_GITHUB.sh and replace YOUR_USERNAME with your GitHub username
nano PUSH_TO_GITHUB.sh
```

**Then run:**
```bash
./PUSH_TO_GITHUB.sh
```

**Or manually run these commands:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/abel-helse-docs.git
git branch -M main
git push -u origin main
```
*(Replace YOUR_USERNAME with your actual GitHub username)*

### 3. Enable GitHub Pages (1 minute)

1. Go to: `https://github.com/YOUR_USERNAME/abel-helse-docs/settings/pages`
2. Under **Source**:
   - Select: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
3. Click **Save**

### 4. Your Live Website! 🎉

After 1-2 minutes, your site will be live at:
```
https://YOUR_USERNAME.github.io/abel-helse-docs/
```

## 📁 Files Included

- `index.html` - Main website (single-page)
- `README.md` - Project documentation
- `PUSH_TO_GITHUB.sh` - Script to push code
- `create_repo.py` - Python script for repo creation (requires token)
- `setup-github.sh` - Alternative setup script

## 🆘 Need Help?

See `GITHUB_SETUP.md` for detailed instructions.

