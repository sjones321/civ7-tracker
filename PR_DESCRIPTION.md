# PR Title
docs: update workflow for Bob-focused development

## Checklist

- [x] Scope is small and focused
- [x] CI passes: markdownlint / html-validate / link-check
- [x] Markdownlint spacing OK: blank line around headings (MD022) and lists (MD032); file ends with a newline
- [x] Docs updated if needed
- [ ] Screenshots or before/after (if UI) - N/A (documentation only)

## Summary

This PR updates all workflow documentation to reflect the transition from Max (Codex PR-based workflow) to Bob (Cursor direct-editing workflow). Lucy (ChatGPT Voice) remains for high-level brainstorming.

### Changes

1. **Updated Workflow Guide** (`docs/workflow_guide.md`)
   - Replaced Lucy→Max loop with Lucy→Bob workflow
   - Added hosting portability and future-proofing guidelines
   - Kept CI requirements and markdown hygiene rules

2. **Updated Contributing Guide** (`CONTRIBUTING.md`)
   - Added Bob to quick flow steps
   - Updated devlog ritual to mention Bob can help with summaries
   - Clarified branching policy for Bob-assisted workflow
   - Added comprehensive hosting portability section

3. **Replaced Checklists** (`docs/checklists/`)
   - Created `pre-commit-checklist.md` for Bob workflow
   - Archived `after-max.md` to `docs/archive/`

4. **Updated Handoff Document** (`chat_handoff.md`)
   - Updated to reflect Bob workflow and Supabase integration
   - Current project status and next actions

5. **Archived Max Docs**
   - Moved `CODEX_SOP.md` to `docs/archive/`
   - Moved `MAX_PROMPT_TEMPLATE.md` to `docs/templates/archive/`

6. **Created Bob Onboarding** (`docs/ONBOARDING_BOB.md`)
   - Comprehensive guide for Bob (Cursor)
   - Documents role, workflow, folder structure, and quick references

## DEVLOG

<!-- DEVLOG:BEGIN -->
- Focus: Transition workflow documentation from Max (Codex) to Bob (Cursor)
- Notable commits/PRs:
  - `docs: update workflow guide for Bob-focused workflow`
  - `docs: update CONTRIBUTING.md for Bob workflow and future-proofing`
  - `docs: replace Max checklist with Bob pre-commit checklist`
  - `docs: update handoff and archive Max-specific docs`
  - `docs: create comprehensive Bob onboarding guide`
- Notes: All Max-specific docs archived (not deleted) for reference. Future-proofing guidelines added for hosting portability. Workflow now supports direct commits to main for small changes, branches+PR for larger/uncertain changes.
<!-- DEVLOG:END -->

