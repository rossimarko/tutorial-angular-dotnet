# 🔧 Git Configuration Guide

## Overview

This project includes proper Git configuration files to ensure consistent development across the team and across different operating systems (Windows, macOS, Linux).

---

## 📋 Files Included

### 1. `.gitignore`
**Purpose**: Prevents sensitive and build files from being committed

**Covers**:
- ✅ .NET build artifacts (bin/, obj/, *.dll)
- ✅ Angular build output (dist/, node_modules/)
- ✅ Environment files (.env, secrets)
- ✅ IDE files (.vs/, .vscode/, .idea/)
- ✅ OS files (Thumbs.db, .DS_Store)
- ✅ Temporary files and logs
- ✅ Local configuration files

**Key Patterns**:
```
# Never commit these:
bin/
obj/
node_modules/
.env
appsettings.local.json
.DS_Store
Thumbs.db
```

**Why It Matters**:
- Prevents accidental commit of passwords/secrets
- Keeps repository clean
- Avoids merge conflicts from auto-generated files
- Protects sensitive configuration

### 2. `.editorconfig`
**Purpose**: Ensures consistent code formatting across the team

**Covers**:
- ✅ Character encoding (UTF-8)
- ✅ Line endings (CRLF for C#, LF for web)
- ✅ Indentation size (4 for C#, 2 for web)
- ✅ C# code style preferences
- ✅ Trailing whitespace handling
- ✅ Final newline enforcement

**Supported By**:
- Visual Studio 2022
- Visual Studio Code
- JetBrains Rider
- Most modern IDEs

**Benefits**:
- No more formatting arguments
- Automatic consistent style
- Better pull request reviews
- Fewer "fix formatting" commits

### 3. `.gitattributes`
**Purpose**: Manages line endings correctly across platforms

**Covers**:
- ✅ Text files: Consistent LF/CRLF handling
- ✅ Binary files: Proper git handling
- ✅ Platform-specific files: .ps1 (Windows), .sh (Unix)

**Why It Matters**:
- Windows uses CRLF (CR LF)
- Unix/Linux/macOS use LF
- Without this, files change unexpectedly when switching platforms
- Prevents "all lines changed" in diffs

**Line Ending Strategy**:
```
C# files:        CRLF (Windows native)
TypeScript/JS:   LF (web standard)
Shell scripts:   LF (Unix standard)
PowerShell:      CRLF (Windows standard)
```

---

## 🚀 Initial Setup

### Step 1: Clone the Repository

```powershell
# Clone the repository
git clone https://github.com/yourusername/tutorial-angular-dotnet.git
cd tutorial-angular-dotnet
```

### Step 2: Verify Git Configuration

```powershell
# Check if git is configured correctly
git config --list

# Should see:
# core.autocrlf=true (on Windows) or false (on Mac/Linux)
```

### Step 3: Configure Your Local Git (First Time Only)

```powershell
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Configure autocrlf (one time setup)
# On Windows:
git config --global core.autocrlf true

# On macOS/Linux:
git config --global core.autocrlf input
```

### Step 4: Verify .gitattributes is Applied

```powershell
# Normalize line endings after first pull
git add --renormalize .

# Commit the normalized files
git commit -m "Normalize line endings"
```

---

## 📝 Git Workflow

### Creating a Branch for Feature Development

```powershell
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/module-1-setup

# Make your changes...
# Then commit:
git add .
git commit -m "feat: Complete Module 1 environment setup"

# Push to remote
git push origin feature/module-1-setup
```

### Commit Message Format

Follow this format for consistency:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Build process, dependencies, tooling

**Examples**:
```
feat(module-1): Add environment setup instructions
fix(docker): Correct SQL Server connection string
docs(api): Update API documentation
chore(deps): Update Angular to v20.1.0
```

### Creating a Pull Request

1. Push your feature branch to GitHub
2. Go to GitHub repository
3. Create Pull Request
4. Add description and link to issues
5. Wait for review
6. Address feedback
7. Merge when approved

---

## ⚙️ IDE Configuration

### Visual Studio 2022

```
Tools → Options → Text Editor → C# → Code Style → Formatting
```

Settings are automatically read from `.editorconfig`

### Visual Studio Code

Install extension:
```
EditorConfig for VS Code
```

Then settings are automatically applied.

### JetBrains Rider

Settings are automatically read from `.editorconfig`

---

## 🔐 Security Best Practices

### Never Commit:

❌ **Secrets and Credentials**
- API keys
- Connection strings
- Passwords
- OAuth tokens
- Database credentials

**Solution**: Use `.env` files (ignored) or Environment Variables

❌ **Local Configuration**
- `appsettings.local.json`
- `.env.local`
- Local IDE settings

**Solution**: Add to `.gitignore`

❌ **Build Artifacts**
- `bin/`, `obj/` (C#)
- `node_modules/`, `dist/` (Angular)
- `*.dll`, `*.pdb`

**Solution**: Already in `.gitignore`

### To Remove Accidentally Committed Files:

```powershell
# Remove from git (but keep locally)
git rm --cached filename

# Or for directory:
git rm -r --cached foldername

# Add to .gitignore if not already there

# Commit the change
git commit -m "Remove sensitive files from tracking"

# Push
git push
```

---

## 🔧 Troubleshooting

### Issue: Line Ending Problems

**Symptom**: "All lines changed" in diff, but no actual changes

**Solution**:
```powershell
# Normalize line endings
git add --renormalize .
git commit -m "Normalize line endings"
```

### Issue: Git Won't Commit Certain Files

**Check your `.gitignore`**:
```powershell
# See what's being ignored
git check-ignore -v filename

# If it's ignored but you want to commit it:
git add -f filename
```

### Issue: Can't Pull Due to Local Changes

```powershell
# Stash your changes temporarily
git stash

# Pull latest
git pull

# Re-apply your changes
git stash pop
```

### Issue: Different Line Endings on Team

**Solution**: Everyone should run:
```powershell
# Windows
git config --global core.autocrlf true

# macOS/Linux
git config --global core.autocrlf input
```

---

## 📚 Git Commands Reference

### Basic Commands

```powershell
# Check status
git status

# See changes
git diff

# Add files
git add .

# Commit
git commit -m "message"

# Push to remote
git push

# Pull from remote
git pull

# See history
git log

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes in file
git checkout -- filename
```

### Branch Commands

```powershell
# List branches
git branch

# Create new branch
git branch feature-name

# Switch branch
git checkout feature-name

# Or create and switch in one:
git checkout -b feature-name

# Delete branch
git branch -d feature-name
```

### Advanced Commands

```powershell
# See what would be committed
git diff --cached

# Interactive commit (choose what to commit)
git add -i

# Squash commits
git rebase -i HEAD~3

# Find which branch has a commit
git branch --contains commit-hash

# Clean up (remove untracked files)
git clean -fd
```

---

## 📋 Team Guidelines

### Before Starting Work:

1. ✅ Sync with main branch: `git pull origin main`
2. ✅ Create feature branch: `git checkout -b feature/name`
3. ✅ Install dependencies: `npm install` (frontend) or `dotnet restore` (backend)

### While Working:

1. ✅ Commit frequently with clear messages
2. ✅ Follow commit message format
3. ✅ Keep commits atomic (one feature per commit)
4. ✅ Don't modify `.gitignore` without team agreement

### Before Pushing:

1. ✅ Run tests locally
2. ✅ Check for console errors
3. ✅ Verify `.gitignore` isn't hiding necessary files
4. ✅ Make sure you're on the right branch

### When Merging:

1. ✅ Create Pull Request
2. ✅ Have someone review
3. ✅ Address all feedback
4. ✅ Merge only when approved
5. ✅ Delete feature branch after merge

---

## 🎯 Summary

**What .gitignore Does**:
- Prevents build artifacts from cluttering repo
- Protects secrets and credentials
- Reduces file conflicts
- Keeps repository clean

**What .editorconfig Does**:
- Enforces consistent formatting
- Works across different IDEs
- Reduces "fix formatting" PRs
- Makes code reviews easier

**What .gitattributes Does**:
- Handles line endings correctly
- Prevents "all lines changed" diffs
- Works across Windows/Mac/Linux
- Ensures binary files handled properly

---

## 📖 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [EditorConfig Homepage](https://editorconfig.org/)
- [Gitignore Templates](https://github.com/github/gitignore)

---

**Happy coding! 🚀**
