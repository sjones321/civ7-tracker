# CIV7 Tracker — Handoff for Next Chat (Post-Hooks Fix)

Project phase: Setup complete -> Workflow polish and docs

Current state (OK):

- Pre-commit hook fixed and stable (PowerShell script calls markdownlint via cmd.exe npx, skips badge when no HTML is staged, inserts/bumps version badge when HTML is staged).
- Markdown files delivered as downloadable full-file replacements during setup to avoid chat fence issues.
- Workflow Guide and Devlog Template are lint-safe and updated.
- CI/Local checks aligned; last push passed.

## What's Already Complete

- Git, GitHub, GitKraken linked; push/pull working.
- Version-badge workflow operational (on staged .html files).
- GitHub Pages live; favicons/OG load correctly.
- Markdown/HTML validation green.
- WORKFLOW_GUIDE.md updated with delivery rule and formatting safety.
- docs/devlog/TEMPLATE.md updated with end-of-day guide.

## What to Do Next (choose one to start the new chat)

1) Docs: Add CONTRIBUTING.md and CHANGELOG.md (lint-safe).
2) CI polish: Optional HTML5 validator, link checker, and/or link rot exceptions.
3) Template polish: Shared JSON for page versions (optional).
4) Base UI skeleton: Prepare minimal HTML/CSS/JS scaffolding for first content page(s) with version badge slot.

In the new chat, say "Load project bootstrap", then pick one of the above. We will keep scope tight (one objective per chat).

## Working Rules (from Workflow Guide)

- Prefer Replacement Packs with markers; use full-file replacements when safer.
- Always supply a Conventional Commit message and manual test steps.
- Keep beginner-friendly steps; avoid multi-topic sprawl per chat.
- During setup/docs, deliver Markdown as downloadable files to avoid formatting issues.

## Quick Terminal Checks (copy/paste)

```bash
# Lint all markdown
npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"

# Verify hooks path
git config --get core.hooksPath
```

## Handoff Checklist

- [ ] Replace any provided files exactly as given.
- [ ] Run the quick checks (above).
- [ ] Stage -> Commit -> Push.
- [ ] Confirm CI green and hard refresh live site (Ctrl+F5).
