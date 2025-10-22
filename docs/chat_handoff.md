# 🧭 CIV7 Tracker — Setup Continuation Brief

**Project phase:** Setup & workflow finalization (not yet main site dev)  
**Current state:** Repository and CI fully functional — now refining workflow and preparing for structured future dev.

---

## ✅ What’s Already Complete

1. **Git + GitHub + GitKraken**  
   - Fully linked and functional  
   - Local commits push cleanly to the main branch  
   - `.gitignore` and version bump pre-commit hook configured and working  

2. **Versioning System**  
   - Auto-increments version badge per page via `.githooks/pre-commit.ps1`  
   - Confirmed working after re-enabling external Git instead of bundled one  

3. **Site Deployment**  
   - GitHub Pages live at:  
     `https://sjones321.github.io/civ7-tracker/`

4. **Quality & Linting**  
   - All **HTML** and **Markdown** validation passes  
   - CI checks include `html-validate`, `markdownlint`, and versioning check  

5. **Branding Assets**  
   - Favicon + Open Graph images integrated and verified  
   - Manifest present at site root (`site.webmanifest`)

6. **Docs**  
   - `README.md` and `docs/workflow_guide.md` fully lint-clean  
   - Workflow guide defines “Load project bootstrap” trigger phrase  

---

## 🎯 What This New Chat Should Continue Working On

This chat should **not** modify site pages yet.  
It should focus on setup improvements, specifically:

1. Creating optional developer docs:
   - `CONTRIBUTING.md`
   - `CHANGELOG.md` (manual or automated version tracking)
   - Split long docs into focused sections if needed

2. Extending automation:
   - Auto-bump page version numbers from shared JSON  
   - Optional: pre-commit auto-changelog entry  

3. Optionally enhancing CI:
   - Add HTML5 validator  
   - Add link checker (lychee)  
   - Add deployment badge to README  

4. Ensuring new workflow rules:
   - Use open/close marker comments for clean edits  
   - Provide clear Conventional Commit messages  
   - Always confirm plan before any coding  

---

## 🗝️ Trigger Phrase

To load the bootstrap and ensure continuity, start the chat with:

```
Load project bootstrap
```

Then clarify:
> “We are continuing setup and workflow refinement (not yet main site coding).”

---

## 🧩 Tone & Instructions for ChatGPT

- Treat the user as **a beginner** — explain everything in **step-by-step** form.  
- Ask clarifying questions before giving code or commands.  
- Use **marker comments** for partial code replacements; whole files only for new or reset files.  
- Provide a **commit message and brief manual test steps** for every change.  
- Keep language plain, approachable, and accurate.  

---
