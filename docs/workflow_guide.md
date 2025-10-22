
# Workflow & Chat Guide

**Trigger phrase:** `Load project bootstrap`

When a new chat starts for this project, the assistant should:

1. Ask clarifying questions first.
2. Summarize the plan and wait for explicit approval.
3. Prefer marker-based **Replacement Packs**; use full files only when necessary.
4. Provide a Conventional Commit message and manual test steps.
5. Keep explanations beginner‑friendly and step‑by‑step.

## Everyday Flow

1. Edit files in Notepad++ and save.
2. GitKraken: Stage → Commit → Push.
3. Version badges auto‑bump on staged `.html` files (pre‑commit hook).
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

```js
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

## Notepad++ Suggestions

- View → Show Symbol → Show All Characters (to spot hidden bytes)
- Preferences → MISC → Enable “File Status Auto-Detection”
- Compare plugin (optional) for quick diffs
