# Checklist — Before Committing with Bob

Use this checklist before committing changes to ensure quality and avoid issues.

## Pre-Commit Checks

- [ ] **Run linting locally** — `npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"`
- [ ] **Validate HTML** — `npx --yes html-validate "**/*.html"`
- [ ] **Check file changes** — Review what's being committed (`git status`, `git diff`)
- [ ] **Test locally** — Verify changes work as expected (use local server if needed)
- [ ] **Commit message** — Use Conventional Commits format: `type(scope?): description`

## Branch Decision

- [ ] **Small, clear change?** → Commit directly to `main`
- [ ] **Larger or uncertain change?** → Create branch (`feature/name` or `fix/name`) → PR → Merge

## After Commit

- [ ] **Pre-commit hook passed** — Version badge updated (if HTML changed) and markdownlint passed
- [ ] **Push to remote** — `git push origin main` or `git push origin branch-name`
- [ ] **CI checks** — Verify CI passes on GitHub (if branch/PR)
- [ ] **Merge and clean up** — If using branch, squash merge and verify branch auto-deleted

