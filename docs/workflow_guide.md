# Workflow Addendum — Markdown & Hook Reliability

This addendum documents the fixes and rules adopted after the pre-commit/markdownlint hiccup, so future sessions avoid repeats.

## Markdown Hygiene (lint-safe)

- Put **one blank line** above and below each heading.
- Put **one blank line** before a list and after a list (MD032).
- Use **dash bullets** (`-`) for lists (MD004).
- Surround fenced code blocks with a blank line **before and after** (MD031).
- Tag fenced blocks with a language (use `text` for plain content) (MD040).
- Avoid bare URLs — use `<...>` or `[label](url)` (MD034).
- End files with **one trailing newline** (MD047).
- Prefer **ASCII** for setup/docs; avoid emojis and smart quotes. If needed, ensure files are saved as **UTF-8 (no BOM)** in Notepad++ (Encoding → UTF-8).

## Delivery Rule for Markdown (during setup/docs)

To avoid chat formatting issues, deliver **Markdown as downloadable full-file replacements**. Reserve inline snippets in chat for short examples only.

## Pre-commit Hook Behavior (expected)

- If no `.html` files are staged: the hook logs `No staged HTML files — skipping badge step.`
- If `.html` files are staged: the hook inserts or bumps the version badge and **re-stages** those files.
- The hook then runs markdownlint via **cmd.exe npx** (bypassing PowerShell’s npx wrapper).

## Quick Troubleshooting

1. **Hook failed (code 1)**: open a terminal at repo root and run:

   ```powershell
   PowerShell -NoProfile -ExecutionPolicy Bypass -File .githooks\pre-commit.ps1 *>&1 | Tee-Object precommit_log.txt
   notepad precommit_log.txt
   ```

2. **If the log shows markdownlint errors**: run

   ```powershell
   npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"
   ```

   Fix spacing around headings/lists or fences per the rules above.
3. **If npx wrapper errors**: already mitigated — hook calls `cmd.exe /c npx ...`.
4. **Badge step confusion**: to test the badge logic, **stage an `.html` file** and commit.

## CI Alignment

Local lint must pass before commit; CI runs the same checks. If CI fails on docs, replace the affected Markdown using the download rule above and re-run the lint command locally.

---

_This addendum can be appended near the end of `docs/workflow_guide.md`._

<!-- START PATCH: Wrap-up & Handoff Ritual -->
## Wrap-up & Handoff Ritual

Use the phrase **“Wrap up this task”** at the end of a milestone to run a structured close-out. The assistant will:

1. **Audit docs for drift** — review the current `docs/workflow_guide.md` and `chat_handoff.md` against this session’s practice and propose exact edits.
2. **Confirm → Generate** — after you confirm, generate **downloadable full-file replacements** for updated docs.
3. **Project-files sync list** — output a list of files to re-upload to the ChatGPT project-files panel (e.g., `ROOT-README.md`, `docs/workflow_guide.md`, `chat_handoff.md`, latest `docs/devlog/YYYY-MM-DD.md`).
4. **.gitignore check** — suggest new ignore rules if needed (e.g., `.git/hooks-log/`).
5. **Sanity tests** — quick checks: markdownlint, local preview (`npx http-server -p 8080`), version badge fetch works, changelog link renders on GitHub.
6. **Next-task nudge** — suggest one bite-sized follow-up milestone and a PR title.
7. **Handoff summary** — provide a concise, copyable summary for the next chat.

### Logger & self-test

- **Logger:** `run-hook-log.bat` captures hook output to `.git/hooks-log/` (keep it ignored).
- **Self-test:** set env `HOOK_SELFTEST=1` before running the hook to perform a no-mutation health check.

### Markdown lint reminders

- Keep **one blank line** around headings, lists, and code fences.
- For **Keep a Changelog**, configure MD024 to allow repeated headings across releases. In `CHANGELOG.md` add at line 1:

  ```markdown
  <!-- markdownlint-configure-file {"MD024": { "siblings_only": true }} -->
  ```
<!-- END PATCH: Wrap-up & Handoff Ritual -->
<!-- START PATCH: CHANGELOG maintenance guide -->
## How we maintain the changelog

This project uses **Keep a Changelog** (human-readable) and **SemVer** (MAJOR.MINOR.PATCH) for releases.

### When to update

- **Every commit that matters to users**: add a short bullet under **Unreleased**.
- Group by type: **Added, Changed, Fixed, Removed, Deprecated, Security, Docs**.
- Write in plain language; one line per change.

### Releasing a version

1. Ensure **Unreleased** bullets are clean and categorized.
2. Decide the version bump:
   - **PATCH**: fixes only
   - **MINOR**: backward-compatible features
   - **MAJOR**: breaking change
3. Move bullets from **Unreleased** into a new `## [X.Y.Z] - YYYY-MM-DD` section.
4. Tag the commit: `git tag vX.Y.Z && git push --tags`.
5. (Optional) Create a GitHub Release pointing to the tag.

### Style/consistency rules

- Link section references at the bottom:  
  `[Unreleased]: https://github.../compare/vX.Y.Z...HEAD` and  
  `[X.Y.Z]: https://github.../releases/tag/vX.Y.Z`
- Keep line width reasonable; avoid smart quotes; end file with one newline (see Markdown Hygiene).

### Tip: version badge & docs

- `docs/site.json` holds `version` and `buildDate`; the pre-commit hook refreshes the date. The UI badge reads from this file at DOM ready.  
<!-- END PATCH: CHANGELOG maintenance guide -->
