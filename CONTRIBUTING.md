# CONTRIBUTING

A short, practical guide for **future me** (solo maintainer) on how to work in this repo consistently. This file is **documentation**—it does not run automatically. The *pre-commit hook* does the enforcing; this file explains the rules.

---

## Who this is for

- Me, now and later. If collaborators ever show up, this doubles as house rules.

---

## Quick flow I follow

1. Make a small, focused change.
2. Stage files in GitKraken.
3. Write a **Conventional Commit** message (see cheat sheet below).
4. Commit. The **pre-commit hook** runs: version badge step (if HTML is staged) + markdownlint.
5. Push to `main`.
6. Visit the live site and hard refresh (Ctrl+F5).

Live site: <https://sjones321.github.io/civ7-tracker/>

---

## Commit messages (Conventional Commits)

Format: `type(scope?): description`

Common types I actually use:

- `feat:` user-visible addition or change
- `fix:` user-visible bug fix
- `docs:` README/guide/changelog/etc.
- `style:` formatting only (no code behavior change)
- `refactor:` internal code/structure change
- `build:` tooling, dependencies, CI
- `chore:` maintenance tasks (no user-visible change)

Examples:

```text
feat: add version badge to index.html
fix: correct viewport meta tag in head snippet
docs: polish workflow guide and add troubleshooting
```

---

## When I update `CHANGELOG.md`

- Update it for **any user-visible change** (new feature, bug fix, doc users will read).
- Use **Keep a Changelog** style with `### Added`, `### Fixed`, `### Changed`, etc.
- MD024 is configured to allow repeated section headers per release.

---

## Devlog ritual (daily)

- Run `new-devlog-today.bat` (or `new-devlog.ps1`). It creates/opens `docs/devlog/YYYY-MM-DD.md` and inserts a **Commit Digest**.
- Ask ChatGPT for a human summary using `docs/devlog/TEMPLATE.md`, paste it into the entry.
- Commit with `docs: add end-of-day summary` (or similar).

The devlog lives in `docs/devlog/`. Template: `docs/devlog/TEMPLATE.md`.

---

## Hooks and what they do

- Hooks live under `.githooks`. One-time setup:

```text
git config core.hooksPath .githooks
git config --get core.hooksPath
```

- **Pre-commit** does two things:
  1) If any `.html` files are staged, it injects/bump the **version badge** (DOM-ready badge driven by `docs/site.json`) and **re-stages** those files.
  2) Runs **markdownlint** via `cmd.exe npx` to avoid PowerShell wrapper issues.

- Expected log when no HTML is staged: `No staged HTML files — skipping badge step.`

- Self-test / debug (from repo root):

```text
PowerShell -NoProfile -ExecutionPolicy Bypass -File .githooks\pre-commit.ps1 *>&1 | Tee-Object precommit_log.txt
notepad precommit_log.txt
```

---

## Lint / validate commands (manual)

- Markdown (respect hygiene rules in the Workflow Guide):

```text
npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"
```

- HTML validation:

```text
npx --yes html-validate "**/*.html"
```

If lint fails, fix spacing around headings/lists/fences; avoid bare URLs by using `<...>` or `[label](url)`; add one trailing newline.

---

## Branching (solo policy)

- Work directly on `main` for tiny changes.
- For bigger work, create a short-lived branch: `feature/short-topic` or `fix/short-topic` and squash-merge locally.

---

## Version badge & site version info

- The shared head snippet reads **`docs/site.json`** at runtime and renders the badge for elements with `data-version-badge`.
- The badge shows `version` and `buildDate`. Keep these updated when doing notable releases.
- If the badge shows “version unavailable”, hard refresh; if still failing, check network path `docs/site.json` and console for errors.

---

## Pull requests (future-proof note)

- If collaborators ever appear, accept PRs that follow these rules and pass lint/validate. For now, PRs are optional since I’m solo.

---

## Troubleshooting

- **Hook failed / stopped commit**: run the self-test (see above). Fix markdownlint errors (usually blank lines around lists/fences or bare links).
- **Badge didn’t appear**: ensure the element has `data-version-badge` and that the page includes the shared head snippet from `docs/head-snippet.txt`.
- **CI failed on docs**: run the same lint commands locally, replace the offending doc as a full-file to avoid chat formatting issues.

---

## Pinned references

- Workflow Guide addendum (lint rules, hook behavior, troubleshooting) lives in `docs/workflow_guide.md`.
- Head snippet (with badge script) lives in `docs/head-snippet.txt`.
- Site version data lives in `docs/site.json`.
