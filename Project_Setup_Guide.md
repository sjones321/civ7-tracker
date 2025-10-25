# Project Setup Guide — CIV7 Tracker

This guide explains how ChatGPT integrates with your project files so any new chat can load the same rules and context.

## Overview

- The phrase **“Load project bootstrap”** tells ChatGPT to use the files you’ve uploaded to the *ChatGPT project files* area as the **source of truth**.

- ChatGPT does **not** auto-fetch your GitHub repository. When you update a core doc locally, **delete and re‑upload** the updated file to the ChatGPT project files so future chats see the latest version.

- Developer daily summaries live in `docs/devlog/` in your repo. Upload the **latest devlog file** when you want a chat to reference that day’s context.

## Core Files (upload these to ChatGPT project files)

| Upload Name (suggested) | Repo Path | Purpose |
| --- | --- | --- |
| `ROOT-README.md` | `/README.md` | Project overview and quick links. |
| `WORKFLOW_GUIDE.md` | `/docs/workflow_guide.md` | Rules for coding sessions, beginner‑mode defaults, markers, commit/test steps. |
| `DEVLOG-TEMPLATE.md` | `/docs/devlog/TEMPLATE.md` | Skeleton used by `new-devlog.ps1` for daily entries. |
| `DEVLOG-README.md` | `/docs/devlog/README.md` | Explains devlog folder and how to create entries. |
| `new-devlog.ps1` | `/new-devlog.ps1` | Creates `docs/devlog/YYYY-MM-DD.md` + pulls Commit Digest. |
| `new-devlog-today.bat` | `/new-devlog-today.bat` | Double‑click helper for today’s entry. |
| `new-devlog-date.bat` | `/new-devlog-date.bat` | Double‑click helper that prompts for a date. |
| `head-snippet.txt` | `/docs/head-snippet.txt` | Reusable `<head>` meta + favicon block for new pages. |
| `chat_handoff.md` | `/chat_handoff.md` | One‑page brief to start a new setup/workflow chat. |

**Why these names?** The ChatGPT project-files panel doesn’t show folders, so using prefixes (`ROOT-`, `DEVLOG-`, etc.) avoids confusion between multiple `README.md` files.

## How to update files

1. Edit the file in your repo and commit.

2. In the ChatGPT project files area: **delete the old file**, then **upload the updated one** (use the same upload name).

3. In a new chat, say **“Load project bootstrap”** — the assistant will use the latest uploads.

## Daily Dev Log Flow

- At the end of a session, run `new-devlog-today.bat` (or `new-devlog.ps1`).

- It creates/opens `docs/devlog/YYYY-MM-DD.md`, prefilled with a **Commit Digest**.

- Ask ChatGPT: *“Generate today’s dev summary for the dev log.”* Paste the human summary into that file and commit/push.

- If you want a new chat to read that day, upload the latest devlog file to the ChatGPT project files (named like `DEVLOG-YYYY-MM-DD.md`). Delete/re‑upload when you add more later that day.

## Bootstrap Behavior

When you type **“Load project bootstrap”**, the assistant will:

- Use the uploaded **WORKFLOW_GUIDE.md** to drive behavior (beginner mode, markers, commit/test steps).

- Follow your **Project Setup Guide** and prefer uploaded files as the canonical reference.

- If you say “read today’s devlog”, it will use the most recently uploaded `DEVLOG-YYYY-MM-DD.md` file.

## Maintenance Notes

- Keep the **repo** as the canonical source; the ChatGPT project files mirror the latest important docs.

- When in doubt, re‑upload the relevant file(s) to refresh the assistant’s context.

## Future Options

- Add a `CONTRIBUTING.md` for collaborators.

- Generate `CHANGELOG.md` releases from Conventional Commits.

- Expand CI with link checking / HTML5 validators / badges as needed.

### Project-file Sync (one folder up)

Keep `project-file-sync.bat` **one directory above** the repo. It fills a sibling folder `project-file-updates\` with the canonical upload files and writes `MANIFEST.txt` next to the `.bat`. Upload the files listed in the manifest to ChatGPT’s project panel after each work session.
