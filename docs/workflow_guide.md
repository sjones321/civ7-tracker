# Workflow & Chat Guide

**Trigger phrase:** `Load project bootstrap`

When a new chat starts for this project, the assistant should:

1. Ask clarifying questions first.
2. Summarize the plan and wait for explicit approval.
3. Prefer marker-based **Replacement Packs**; use full files only when necessary.
4. Provide a Conventional Commit message and manual test steps.
5. Keep explanations beginner-friendly and step-by-step.

## Everyday Flow

1. Edit files in Notepad++ and save.
2. GitKraken: Stage → Commit → Push.
3. Version badges auto-bump on staged `.html` files (pre-commit hook).
4. Verify on the live site and hard refresh (Ctrl+F5).

## Head Snippet (paste into each page `<head>`)

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CIV7 Tracker</title>
<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta property="og:title" content="CIV7 Tracker">
<meta property="og:description" content="Track Civilization VII info at a glance.">
<meta property="og:url" content="https://sjones321.github.io/civ7-tracker/">
<meta property="og:image" content="https://sjones321.github.io/civ7-tracker/img/og-card.png">
<meta name="theme-color" content="#001a33">
<meta name="description" content="Track Civilization VII info at a glance.">
<meta name="twitter:card" content="summary_large_image">
```

## Markers (for surgical edits)

### HTML

```html
<!-- [SECTION START] header-nav v1 -->
<!-- content -->
<!-- [SECTION END] header-nav v1 -->
```

### CSS

```css
/* [BLOCK START] .site-header v1 */
/* styles */
/* [BLOCK END] .site-header v1 */
```

### JavaScript

```javascript
// [FUNC START] buildNav() v1
function buildNav() { /* ... */ }
// [FUNC END] buildNav() v1
```

## Commit Style (Conventional)

Use: `<type>(optional-scope): short summary`

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `chore:` config/infra/maintenance
- `style:` visual/formatting only

## Voice Summary Template

```text
VOICE SUMMARY (dd mmm yyyy)
Topic:
Decisions (LOCKED / TENTATIVE):
- [LOCKED] ...
- [TENTATIVE] ...
Constraints:
- ...
Next Actions:
1) ...
2) ...
```

## End-of-Day Summary Workflow

Each development session should end with a summary logged in `docs/devlog/YYYY-MM-DD.md`.

### Steps

1. Run `new-devlog-today.bat` (or `new-devlog.ps1`) to open today’s file.
2. Ask ChatGPT: “Generate today’s dev summary for the dev log.”
3. Paste the cleaned summary using the format below.

### Summary Format

```markdown
# 🌙 CIV7 Tracker — End of Day Summary (Phase Name)

**Date:** 2025-10-22  
**Focus:** <short focus>

## ✅ Accomplishments
- ...

## ⚙️ Next Planned Phase
- ...

## 🧠 Reflection
- ...
```

Keep **one blank line** between headings and content. Use **dash bullets** (`-`). Tag any code fences as `text`. Avoid bare URLs by wrapping them in `<angle brackets>` or using `[label](url)`.

## Formatting Safety When Copying from ChatGPT

Sometimes multi-layer examples (a code block that shows another code block) can cause fences to split, or closing comments to land **outside** the fence. Before committing:

- Ensure every opening triple backtick (```) has a matching closing triple backtick at the end of the intended section.
- Keep end-marker comments (like `<!-- [BLOCK END] ... -->`) **inside** the correct fenced block when they are part of that block.
- If you must show a code block *inside* another code block, prefer using **four backticks** for the outer fence to avoid accidental closure. For example, write: four-backticks, `markdown` on the same line, content with regular triple backticks inside, then four-backticks to close.

## Delivery Rule for Markdown Files

To avoid chat formatting issues, **Markdown files should be delivered as downloadable full-file replacements** during setup and documentation work. Inline Markdown in chat is allowed for short snippets only. When a full file is provided via download, prefer replacing the entire file instead of piecemeal edits.

## Notepad++ Suggestions

- View → Show Symbol → Show All Characters (to spot hidden bytes)
- Preferences → MISC → Enable “File Status Auto-Detection”
- Compare plugin (optional) for quick diffs
