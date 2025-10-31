# Devlog Automation Workflows

This guide explains the two GitHub Actions that keep the devlog up to date.

## Merge-time entry

Every time a pull request is merged, the **Append Devlog Entry on Merge** workflow automatically adds a new bullet to the devlog for the day that the merge happened in the America/Phoenix timezone. The workflow writes to `docs/devlog/YYYY-MM-DD.md`, creating the file if necessary.

The workflow looks for an optional devlog section in the pull request body. If it finds one, the enclosed text becomes the bullet content. Otherwise it writes a default line with the pull request number and title.

```markdown
<!-- DEVLOG_START -->
Short human summary here.
<!-- DEVLOG_END -->
```

## Daily summary job

The **Update Devlog Daily Summary** workflow can be triggered manually from the Actions tab with the **Run workflow** button. Provide the summary text, and optionally a custom title or a specific date (`YYYY-MM-DD`, America/Phoenix). The job updates the top **Daily Summary** block in that day's devlog, creating the file or block if it doesn't exist yet.

Both workflows commit their changes back to the repository with a `[skip ci]` commit message so they do not trigger additional CI runs.
