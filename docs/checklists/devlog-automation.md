# Devlog Automation — No manual editing

## What this pack does
- **Auto-append on PR merge**: When a PR is merged, a devlog entry is appended to `docs/devlog/YYYY-MM-DD.md` automatically.
- **Daily Summary (manual trigger)**: From GitHub → Actions → “Devlog — write Daily Summary”, paste your end‑of‑day paragraph; the job writes/replaces the top summary block for today.

## Use a DEVLOG section in PRs (optional but recommended)
Add this to your PR description so the merge entry is meaningful:
```md
<!-- DEVLOG_START -->
Fixed MD046 (indented block) and MD012 (blank lines) so markdownlint & quality jobs pass in CI.
<!-- DEVLOG_END -->
```

## Example of what gets written
```md
## chore(devlog): add devlog automation and today’s entry; pass markdownlint

Merged PR #123 — chore(devlog): add devlog automation and today’s entry; pass markdownlint

- PR: #123 (https://github.com/USER/REPO/pull/123)
- Branch: feature/devlog-automation-and-entry-2025-10-25
```

## Run the Daily Summary job
- GitHub → Actions → “Devlog — write Daily Summary” → Run workflow
- Fill “summary” with your paragraph (Lucy can draft it). The job writes between markers:
```md
## Daily Summary
<!-- DAILY_SUMMARY_START -->
Today: CI green on devlog automation; added helpers and SOP; queued CI lint workflow.
<!-- DAILY_SUMMARY_END -->
```