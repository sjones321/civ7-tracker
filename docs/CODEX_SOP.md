# CIV7 Tracker — CODEX SOP

This Standard Operating Procedure documents the baseline rituals for daily maintenance,
automation helpers, and lint validation. Follow it whenever you open a new session.

## Daily open checklist

1. Pull the latest changes and install dependencies (if any).
2. Run the devlog generator when starting a new day.

    ```powershell
    PowerShell -NoProfile -ExecutionPolicy Bypass -File ./new-devlog.ps1
    ```

3. Update `Focus` in the freshly created devlog entry.
4. Review the previous day’s Daily Summary to stay aligned.

## Logging progress mid-day

Use the append helper for each meaningful change. It keeps the Daily Summary block and the
Accomplishments list in sync.

```powershell
PowerShell -NoProfile -ExecutionPolicy Bypass -File ./tools/devlog-append.ps1 -Title "docs: quick headline" -Description "why it matters"
```

If you prefer the batch wrapper:

```bat
tools\devlog-append.bat -Title "docs: quick headline" -Description "why it matters"
```

## Wrap-up ritual

1. Run the wrap-up helper to surface the Daily Summary bullets and copy them to the clipboard.

    ```powershell
    PowerShell -NoProfile -ExecutionPolicy Bypass -File ./tools/devlog-wrapup.ps1
    ```

2. Use the console output as the PR summary and chat hand-off.
3. Verify the Commit Digest appended by `new-devlog.ps1` reflects the last commits of the day.

## Lint and validation suite

Run the exact commands before committing or pushing:

```bash
npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"
```

```bash
npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**" --fix
```

```bash
npx --yes html-validate "**/*.html"
```

Record the terminal output in the PR description if any command fails locally so CI can
reproduce the environment issue.

## File delivery etiquette

- Deliver Markdown edits as full-file replacements (per workflow guide).
- Tag every fenced block with an explicit language (`md`, `powershell`, `bat`, `bash`, or `text`).
- Keep wrap-up summaries synchronized between the Daily Summary markers and the
  Accomplishments section.
