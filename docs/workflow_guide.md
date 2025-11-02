# Workflow Guide — Operational Playbook

This document describes how we ship changes with Lucy (brainstorming), Bob (Cursor execution), CI checks, and the devlog automations. Follow these rules to keep the pipeline green and predictable.

## Lucy ↔ Bob Workflow

- **Lucy (ChatGPT Voice)** — High-level brainstorming and planning. Provides summaries of discussions for Bob.
- **Bob (Cursor)** — Primary coding agent. Reads files directly, makes edits locally, commits to Git.
- **Flow:** Brainstorm in Lucy → Summarize for Bob → Bob implements locally → Commit/Push → CI validates → Devlog records.

### Decision Making

- **Small, clear changes:** Commit directly to `main`.
- **Larger or uncertain changes:** Create a branch → PR → Review → Merge.

## CI (required)

- markdownlint
- html-validate
- link-check

All CI checks must pass before merging to `main`.

## Branch Protection

- Require CI checks to pass.
- Squash merge preferred for clean history.
- Auto-delete merged branches.

## Hosting Portability & Future-Proofing

The codebase is designed to be portable across static hosting services (GitHub Pages, Netlify, Cloudflare Pages, Vercel, etc.).

### Best Practices

- **Use standard web APIs** — No platform-specific features.
- **External API keys in config files** — Easy to swap per environment (e.g., `js/supabase-config.js`).
- **Relative paths for assets** — No hardcoded domain references.
- **Static files only** — No server-side dependencies.
- **External APIs work from any origin** — Backend services (like Supabase) handle CORS properly.

### What to Avoid

- ❌ Platform-specific CI/CD dependencies (e.g., GitHub Actions that only work on GitHub Pages).
- ❌ Hosting-specific features that lock you to one provider.
- ❌ Server-side rendering requirements.
- ❌ Hardcoded domain URLs in code.
- ❌ Absolute paths that assume a specific deployment structure.

### Migration Checklist

If switching hosts:
1. Copy static files to new host.
2. Update API config files if needed (usually same values).
3. Configure custom domain (optional).
4. Update CORS settings in external APIs (if required).

## Markdown Hygiene

- Blank lines around headings/lists.
- Language-tag fences; surround fences with blank lines.
- Avoid bare URLs; prefer `<https://...>` or `[label](https://...)`.
- Save as UTF-8 (no BOM).
