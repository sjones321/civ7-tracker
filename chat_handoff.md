# CIV7 Tracker — Project Handoff Summary (2025-11-02)

## Current Status

* **Devlog automation** — ✅ Fully operational through GitHub Actions.

  * Merged PRs append automatically.
  * "Devlog — write Daily Summary" workflow verified.

* **PR Template** — ✅ Active (`.github/pull_request_template.md`) with DEVLOG markers.

* **CI Checks (required)** — ✅ markdownlint, html-validate, link-check all active and required on main.

* **Auto-delete branches** — ✅ Enabled on squash merge.

* **Supabase Integration** — ✅ Completed (2025-11-02).

  * Replaced `localStorage` with Supabase backend.
  * World Wonders editor now saves to shared database.
  * Database schema created for all game entities.
  * Documentation complete: setup, integration, and migration guides.

* **Workflow Updated** — ✅ Transitioned from Max (Codex) to Bob (Cursor).

  * Bob (Cursor) is primary coding agent — reads files directly, makes edits locally.
  * Lucy (ChatGPT Voice) used for high-level brainstorming.
  * Workflow docs updated to reflect Bob-focused approach.

* **Hosting** — ✅ GitHub Pages (portable for future migration).

  * Codebase designed for portability across static hosts.
  * Future-proofing guidelines documented.

* **Versioning** — ✅ `docs/site.json` auto-bumped by pre-commit hook.

---

## Workflow Overview

**Current workflow:**

* **Lucy (ChatGPT Voice)** — High-level brainstorming and planning. Provides summaries for Bob.
* **Bob (Cursor)** — Primary coding agent. Reads files directly, makes edits locally, explains decisions.
* **Flow:** Brainstorm in Lucy → Summarize for Bob → Bob implements locally → Commit/Push → CI validates → Devlog records.

**Branch strategy:**

* Small, clear changes → Commit directly to `main`.
* Larger or uncertain changes → Create branch → PR → Review → Merge.

---

## Next Actions

1. **Continue feature development** with Bob (Cursor).

2. **Add more data editors** — Natural Wonders, City-States, Civilizations, etc. using Supabase backend.

3. **Complete database migration** — Ensure all existing data is migrated to Supabase.

---

## Key Files & References

* Workflow Guide: `docs/workflow_guide.md`
* Contributing Guide: `CONTRIBUTING.md`
* Supabase Documentation: `docs/supabase/`
* Pre-Commit Checklist: `docs/checklists/pre-commit-checklist.md`
* Devlog: `docs/devlog/`
* Learning Log: `docs/learninglog/`

---

## Notes

Before committing:

* Run `npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"`
* Run `npx --yes html-validate "**/*.html"`

If clean → commit, push, and let the devlog workflow handle the rest.
