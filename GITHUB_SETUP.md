# GitHub Repository Setup Instructions

## ⚠️ IMPORTANT: Update Repository URLs

All documentation files contain placeholder URLs that need to be updated with your actual GitHub repository information.

---

## Step 1: Find Your Repository URL

1. Go to your GitHub repository in a web browser
2. Copy the repository URL from the address bar
3. It should look like: `https://github.com/USERNAME/REPOSITORY-NAME`

**Example:**
- If your GitHub username is `johnsmith`
- And your repo is `IT342_Phase1_Doughly-Crumbl_Cabatana`
- Your URL is: `https://github.com/johnsmith/IT342_Phase1_Doughly-Crumbl_Cabatana`

---

## Step 2: Replace Placeholders in Documentation

Search and replace `[your-repo]` in these files:

### Files to Update:
1. `docs/DESIGN_PATTERNS_REPORT.md`
2. `docs/DESIGN_PATTERNS_SUMMARY.md`
3. `README_DESIGN_PATTERNS.md`
4. `SUBMISSION_CHECKLIST.md`

### Find and Replace:
**Find:** `[your-repo]/IT342_Phase1_Doughly-Crumbl_Cabatana`  
**Replace with:** `YOUR-USERNAME/IT342_Phase1_Doughly-Crumbl_Cabatana`

**Example:**  
Replace `[your-repo]` with `johnsmith` (or your actual username)

---

## Step 3: Verify Links Work

After updating, these links should be accessible:

### 1. Repository Home
```
https://github.com/YOUR-USERNAME/IT342_Phase1_Doughly-Crumbl_Cabatana
```

### 2. Feature Branch
```
https://github.com/YOUR-USERNAME/IT342_Phase1_Doughly-Crumbl_Cabatana/tree/feature/design-patterns-refactor
```

### 3. Implementation Commit
```
https://github.com/YOUR-USERNAME/IT342_Phase1_Doughly-Crumbl_Cabatana/commit/b8f9fb9a3e4f3729fb8516a6214f520f35b9b1cc
```

**Test each link** by opening them in your browser!

---

## Commit Information Reference

Use these details when referencing your implementation:

**Branch Name:**
```
feature/design-patterns-refactor
```

**Commit Hash (Full):**
```
b8f9fb9a3e4f3729fb8516a6214f520f35b9b1cc
```

**Commit Hash (Short - first 7 characters):**
```
b8f9fb9
```

**Commit Message:**
```
Applied 6 design patterns to improve code quality

Implemented 6 design patterns as per IT342 assignment requirements:

Creational Patterns:
- Factory Pattern: Centralized order creation
- Builder Pattern: Simplified DTO construction

Structural Patterns:
- Adapter Pattern: Unified entity-to-DTO conversion
- Decorator Pattern: Flexible response enhancement

Behavioral Patterns:
- Strategy Pattern: Encapsulated order status transitions
- Observer Pattern: Decoupled notifications

Impact: Reduced service code by 19%, eliminated duplicate mapping
```

---

## Quick Update Script (Find/Replace in VS Code)

1. Press `Ctrl+Shift+H` (Windows) or `Cmd+Shift+H` (Mac)
2. Enable "Use Regular Expression" (icon: `.*`)
3. **Find:** `\[your-repo\]/IT342_Phase1_Doughly-Crumbl_Cabatana`
4. **Replace:** `YOUR-GITHUB-USERNAME/IT342_Phase1_Doughly-Crumbl_Cabatana`
5. Click "Replace All in Files"
6. Review changes before saving!

---

## For Your PDF Submission

Include this information in your **Section C (Refactoring Report)**:

### Implementation Details Box:
```
┌─────────────────────────────────────────────────┐
│ GitHub Repository Information                    │
├─────────────────────────────────────────────────┤
│ Branch: feature/design-patterns-refactor         │
│ Commit: b8f9fb9a3e4f3729fb8516a6214f520f35b9b1cc │
│ Link: [insert your commit URL here]             │
└─────────────────────────────────────────────────┘
```

This demonstrates that your implementation is versioned and accessible for review.

---

## ✅ Checklist

- [ ] Found your GitHub repository URL
- [ ] Replaced all `[your-repo]` placeholders
- [ ] Tested repository home link
- [ ] Tested branch link
- [ ] Tested commit link
- [ ] All links open successfully
- [ ] Committed updated documentation files
- [ ] Ready to include in PDF submission

---

**Need Help?**

If you're unsure about your repository URL:
1. Go to github.com and sign in
2. Click on your profile icon (top right)
3. Click "Your repositories"
4. Find `IT342_Phase1_Doughly-Crumbl_Cabatana`
5. Click on it and copy the URL from the address bar
