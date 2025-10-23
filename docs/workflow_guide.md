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

<!-- START PATCH: Project-file Sync Helper -->
## Project-file Sync Helper

We keep a curated set of “project files” in ChatGPT’s project panel so new chats can bootstrap quickly.  
Use the one-level-up script **`project-file-sync.bat` (v6.1-Stable)** to gather the files with safe names and produce a MANIFEST.

### Canonical upload set (names as they appear in ChatGPT)
- `ROOT-README.md`  ← from `README.md`
- `workflow_guide.md`  ← from `docs/workflow_guide.md`
- `chat_handoff.md`  ← from `chat_handoff.md`
- `head-snippet.txt`  ← from `docs/head-snippet.txt`
- `site.json`  ← from `docs/site.json`
- `DEVLOG-README.md`  ← from `docs/devlog/README.md`
- `TEMPLATE.md`  ← from `docs/devlog/TEMPLATE.md`
- `new-devlog.ps1`
- `new-devlog-today.bat`
- `new-devlog-date.bat`
- `pre-commit.ps1`  ← from `.githooks/pre-commit.ps1`
- `.gitignore`
- `DEVLOG-YYYY-MM-DD.md`  ← latest devlog from `docs/devlog/`

### Where the script lives
Place `project-file-sync.bat` **one directory above** your repo. It creates `project-file-updates\` beside itself, and writes **`MANIFEST.txt` + `project-file-sync.log`** next to the `.bat`.

### How to run
1. Double-click `project-file-sync.bat` (or pass your repo path as the first argument).
2. Upload **only** the files listed in `MANIFEST.txt` to ChatGPT’s project-files panel.
3. Skip `MANIFEST.txt` and the `.bat` itself — they are for your convenience.

### Version
Current stable: **v6.1** — single PowerShell block + .NET write ensures a guaranteed MANIFEST on OneDrive paths.
<!-- END PATCH: Project-file Sync Helper -->

