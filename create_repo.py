#!/usr/bin/env python3
"""
Script to create GitHub repository and enable Pages
Requires GitHub Personal Access Token with repo scope
"""

import subprocess
import sys
import json
import urllib.request
import urllib.error
import getpass

REPO_NAME = "abel-helse-docs"
REPO_DESCRIPTION = "Abel Helse documentation website"

def create_github_repo(token, username):
    """Create GitHub repository using API"""
    url = "https://api.github.com/user/repos"
    
    data = {
        "name": REPO_NAME,
        "description": REPO_DESCRIPTION,
        "public": True,
        "auto_init": False
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            return result.get("clone_url"), result.get("html_url")
    except urllib.error.HTTPError as e:
        error_data = e.read().decode()
        print(f"❌ Error creating repository: {e.code}")
        print(f"Response: {error_data}")
        return None, None

def setup_git_remote(repo_url):
    """Add remote and push code"""
    try:
        # Check if remote already exists
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("⚠️  Remote 'origin' already exists")
            response = input("Replace it? (y/n): ")
            if response.lower() != 'y':
                return False
            subprocess.run(["git", "remote", "remove", "origin"], check=True)
        
        subprocess.run(["git", "remote", "add", "origin", repo_url], check=True)
        subprocess.run(["git", "branch", "-M", "main"], check=True)
        subprocess.run(["git", "push", "-u", "origin", "main"], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Git error: {e}")
        return False

def main():
    print("🚀 GitHub Repository Setup")
    print("=" * 50)
    
    # Get GitHub token
    print("\n📝 You need a GitHub Personal Access Token")
    print("   Create one at: https://github.com/settings/tokens")
    print("   Required scope: 'repo'")
    token = getpass.getpass("\nEnter your GitHub token: ")
    
    if not token:
        print("❌ Token required. Exiting.")
        sys.exit(1)
    
    # Get username (optional, for display)
    username = input("GitHub username (optional): ").strip()
    
    # Create repository
    print(f"\n📦 Creating repository: {REPO_NAME}...")
    clone_url, html_url = create_github_repo(token, username)
    
    if not clone_url:
        print("\n❌ Failed to create repository")
        print("\n📋 Manual setup instructions:")
        print("1. Go to https://github.com/new")
        print(f"2. Create repository: {REPO_NAME}")
        print("3. Run: git remote add origin https://github.com/YOUR_USERNAME/abel-helse-docs.git")
        print("4. Run: git push -u origin main")
        sys.exit(1)
    
    print(f"✅ Repository created: {html_url}")
    
    # Setup git remote and push
    print("\n📤 Pushing code to GitHub...")
    if setup_git_remote(clone_url):
        print("✅ Code pushed successfully!")
        print(f"\n🌐 Repository: {html_url}")
        print("\n📝 Next steps:")
        print("1. Go to Settings > Pages")
        print("2. Source: Deploy from a branch")
        print("3. Branch: main, Folder: / (root)")
        print("4. Save")
        print(f"\n✨ Your site will be live at: https://{username or 'YOUR_USERNAME'}.github.io/{REPO_NAME}/")
    else:
        print("\n⚠️  Failed to push code")
        print(f"   Repository created at: {html_url}")
        print("   You can push manually with:")
        print(f"   git remote add origin {clone_url}")
        print("   git push -u origin main")

if __name__ == "__main__":
    main()

