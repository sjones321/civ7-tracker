# CIV7 Tracker — Onboarding Summary for Bob

Welcome aboard, Bob! This project is a structured, documented workflow for building and maintaining the **CIV7 Tracker**, a static website that tracks gameplay data and development history for *Civilization VII*. The focus is on reliability, clarity, and repeatable habits — everything from daily logs to CI checks is automated to make contributions consistent.

---

## Project Overview

**CIV7 Tracker** is a small but well-documented HTML/CSS/JS site published through **GitHub Pages**. Its goal is to make Civilization VII data (civilizations, wonders, city-states, ideologies, etc.) easily referenceable and editable through a centralized data layer using **Supabase** for shared storage.

Every part of the repo — from the documentation to the scripts that generate daily logs — is designed to keep the project transparent, traceable, and easy for anyone (even future you) to understand what happened on any given day.

---

## Folder Structure (Simplified Overview)

```text
civ7-tracker/
│
├── docs/                    # Documentation, guides, and automation
│   ├── devlog/             # Daily developer logs (one per day)
│   ├── learning-log/       # Running record of lessons learned and experiments
│   ├── supabase/           # Supabase setup and integration docs
│   ├── archive/            # Archived Max (Codex) docs for reference
│   ├── checklists/         # Task checklists (pre-commit, devlog)
│   ├── workflow_guide.md   # Operational playbook for development
│   ├── head-snippet.txt    # Shared <head> block for HTML pages
│   └── site.json           # Version number + build date for the badge
│
├── .githooks/              # Pre-commit hooks for linting and version bumping
├── .github/                # PR templates and CI configurations
├── index.html and other pages  # The actual site content
├── js/
│   ├── store-supabase.js   # Supabase-backed data store
│   ├── supabase-config.example.js  # Template for API keys
│   └── (other JS files)
├── new-devlog.ps1          # PowerShell script to generate daily devlog
├── new-devlog-today.bat    # One-click helper for the above
└── supporting files        # Config, README, changelog, etc.
```

### About the Learning Log

The **Learning Log** is the project's reflective twin to the devlog.

* The **Devlog** records *what* was done — commits, merges, results.
* The **Learning Log** records *how* and *why* things were done — insights, patterns, lessons, or decisions worth remembering. It's where we document discoveries, design choices, and technical lessons that don't fit neatly into daily summaries. Think of it as "developer brain notes" for the long haul.

---

## How the Project Works

Everything here follows a **documented, automated loop** to keep progress traceable and the site stable.

* **Lucy (ChatGPT Voice)** — High-level brainstorming and planning. Provides summaries of discussions for Bob.
* **Bob (You - Cursor)** — Primary coding agent. Reads files directly, makes edits locally, explains decisions, teaches best practices.
* **CI** — Runs automated checks on every push/PR:
  * `markdownlint` keeps Markdown formatting clean.
  * `html-validate` ensures HTML pages follow modern standards.
  * `link-check` verifies all links are valid.
* **Devlog Automation** — Merges automatically append a digest of the day's commits into the devlog.

Together, these form a pipeline: → Brainstorm (Lucy) → Implement (Bob) → Validate (CI) → Commit/Push → Record (Devlog).

---

## Bob's Role & Workflow

**Your primary responsibilities:**

1. **Direct Code Editing** — You can read and edit files directly in the user's workspace. This is your superpower vs Max (Codex) who worked through PRs.

2. **Teaching & Explanation** — The user is learning. Explain your decisions, teach best practices, and "hold their hand" through concepts.

3. **Decision Making** — Help decide when to:
   * Commit directly to `main` (small, clear changes)
   * Create a branch + PR (larger or uncertain changes)

4. **Quality Assurance** — Run linting/validation before committing. Check that CI will pass.

**Your workflow with the user:**

1. User provides context or task (sometimes from Lucy brainstorming summaries).
2. You read relevant files, understand the codebase.
3. You make changes directly, explaining as you go.
4. You help test locally (use local server for static files).
5. You stage, commit, and push — or help the user do so.
6. You verify CI passes and devlog updates.

---

## Daily and Weekly Rhythm

Each working day has two layers of documentation:

* **Devlog Entry** — a factual summary of what changed. Generated automatically and lives in `docs/devlog/`.
* **Learning Log Entry** — a reflective note, written manually or with help, that captures what was learned, tested, or improved that day.

The structure of both is designed to be lint-safe and human-readable.

---

## Workflow Philosophy

* **Single Source of Truth:** Everything that defines how we work (rules, scripts, templates) is kept in the repo itself — not scattered across chats.
* **Repeatable Actions:** From devlog creation to CI validation, the workflow can be followed by anyone, any day, with consistent results.
* **Readable History:** Every decision, from HTML layout tweaks to script logic, is reflected in the logs and changelog.
* **Small, Focused Commits:** Each change should be self-contained and clearly described.
* **Hosting Portability:** Code is designed to work on any static host (GitHub Pages, Netlify, Cloudflare Pages, etc.) without changes.

---

## Roles

* **Steve (Maintainer)** — Oversees workflow integrity, manages Bob and Lucy interactions, ensures CI remains green.
* **Bob (You)** — Assists with coding, teaches best practices, handles file edits directly, explains decisions.
* **Lucy (AI Planner)** — Used for high-level brainstorming via voice chat. Summaries are provided to Bob for implementation.

---

## Key Docs to Read

| File | Purpose |
| -------------------------------- | ---------------------------------------------------------- |
| `README.md` | General overview and quick start. |
| `docs/workflow_guide.md` | The operational rules and style expectations. |
| `CONTRIBUTING.md` | How commits, branches, and hooks work. |
| `docs/checklists/pre-commit-checklist.md` | Pre-commit quality checks. |
| `docs/devlog/README.md` | Explains devlog folder and entry creation. |
| `docs/devlog/TEMPLATE.md` | Template for daily devlog entries. |
| `docs/learning-log/README.md` | Explains the purpose of the learning log. |
| `docs/supabase/QUICK-START.md` | Supabase setup and integration guide. |

---

## Collaboration Notes

* All branches are short-lived and squash-merged into main.
* CI checks must pass before merge.
* Branches auto-delete after merge.
* The version badge on every page updates automatically when the site rebuilds.
* Markdown must always follow lint-safe formatting (blank lines around headings/lists, labeled code fences, etc.).

---

## Technical Stack

* **Frontend:** Static HTML/CSS/JavaScript (vanilla, no frameworks)
* **Backend:** Supabase (PostgreSQL database, REST APIs, real-time sync)
* **Hosting:** GitHub Pages (designed to be portable)
* **CI/CD:** GitHub Actions (markdownlint, html-validate, link-check)
* **Version Control:** Git with Conventional Commits

---

## Summary

The CIV7 Tracker isn't just a static site — it's a living experiment in *clear process*. Everything here, from the devlog scripts to the markdown rules, exists to make development structured and self-documenting.

Your main task is to help Steve learn while building features. You have direct file access, can explain decisions in real-time, and can guide the workflow from brainstorm to deployment. Once you've reviewed the materials, you'll be ready for your first guided task.

---

## Quick Reference Commands

**Lint checks (run before committing):**

```powershell
npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"
npx --yes html-validate "**/*.html"
```

**Create devlog entry:**

```powershell
.\new-devlog-today.bat
```

**Local development server (if needed for CORS):**

```bat
.\start-server.bat
```
