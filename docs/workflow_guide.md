# Workflow Guide — Operational Playbook

This document describes how we ship changes with Lucy (planning), Max (Codex executor), CI checks, and the devlog automations. Follow these rules to keep the pipeline green and predictable.

## Lucy ↔ Max Loop

- Plan in Lucy → Hand off to Max → PR with CI → Merge (squash) → Devlog appends.

## CI (required)

- markdownlint
- html-validate
- link-check

## Branch Protection

- Require PR, CI, squash; auto-delete merged branches.

## Markdown Hygiene

- Blank lines around headings/lists.
- Language-tag fences; surround fences with blank lines.
- Avoid bare URLs; prefer `<https://...>` or `[label](https://...)`.
- Save as UTF-8 (no BOM).
