# CIV7 Tracker – Workflow & Chat Coordination Guide

> **Note for AI / Project Partner**  
> When the user says **“Load project bootstrap”**, read and follow this guide *before producing any code*.  
> Default to **BEGINNER MODE**: ask clarifying questions first, provide clear step‑by‑step instructions, and **wait for explicit confirmation** before coding. Prefer **marker‑based Replacement Packs** over whole files. Always include a **Conventional Commit message** and **manual test steps**.

**Repo:** https://github.com/sjones321/civ7-tracker  
**Live:** https://sjones321.github.io/civ7-tracker/  
**Tech:** Plain HTML/CSS/JS (no frameworks)  
**Editor:** Notepad++  
**Version Control:** Git + GitKraken (system Git, NOT bundled)  
**Hosting:** GitHub Pages (`main` / `/root`)  
**Trigger Phrase:** “Load project bootstrap”

---

## 0) Why this guide exists (short)
- **Consistency:** Every new chat follows the same rules and style.  
- **Beginner‑friendly:** Instructions are explicit, clickable, and paced.  
- **Safety:** Avoid “patch pileups”; favor clean replacements and versioning.  
- **Traceability:** Commits, test steps, and page-level version badges.

---

## 1) Everyday Flow (Edit → Commit → Deploy)

1. **Edit** in Notepad++ → **Save**.  
2. **Version badge**: keep `Version vX.Y.Z (pageTag)` near the top of each page.  
   - A pre‑commit hook **auto‑bumps the patch** for **staged `.html` files**.  
3. **GitKraken**: **Stage → Commit → Push**.  
4. **Verify** live site: open the GitHub Pages URL → **Ctrl+F5** → confirm the badge.

**Why this matters:** You always know which version is live, and you develop a repeatable muscle‑memory loop.

---

## 2) Commit Style (Conventional, simplified)

**Format:** `<type>(optional-scope): short summary`

| Type | Use for | Examples |
|---|---|---|
| `feat:` | new feature/content | `feat(header): add responsive nav` |
| `fix:` | bug fix | `fix(main): correct image path` |
| `chore:` | maintenance/config/version bump | `chore(index): bump version to v0.0.8` |
| `style:` | formatting/visual‑only (no behavior) | `style(nav): tighten spacing` |
| `docs:` | documentation | `docs: update workflow guide (task protocol)` |

**Why this matters:** Clean history. You can scan commits and understand *what* changed.

---

## 3) Accessibility & Semantic HTML (plain English)

- **Alt text (images):** Every `<img>` needs a short description in `alt=""` so screen‑reader users (and broken images) make sense.  
  - Example: `<img src="city.png" alt="Map icon for scientific city state">`  
  - If the image is decorative only, use empty alt: `alt=""`.

- **Visible focus (keyboard):** When using **Tab**, links/buttons must show a clear outline. Keep or customize the outline:  
  ```css
  :focus { outline: 2px solid #f2880f; outline-offset: 2px; }
  ```

- **Semantic HTML:** Use tags that describe meaning, not just appearance:  
  `<header> <nav> <main> <section> <article> <footer>` and add `aria-` attributes as needed (e.g., `aria-label="Primary"` on `<nav>`).

**Tiny example (shows all three):**
```html
<header class="container">
  <h1>CIV7 Tracker</h1>
  <nav aria-label="Primary">
    <a href="index.html">Home</a>
  </nav>
</header>
<img src="city.png" alt="Map icon for scientific city state">
```

**Why this matters:** Real users rely on these cues; semantic, accessible pages are easier to maintain and rank better.

---

## 4) Looping / Patch Behavior (Task Isolation)

- **One chat = one focused element/feature** (e.g., header, footer, modal).  
- If code is messy, request a **clean full‑file replacement** instead of stacking patches.  
- Use branches for risk: `feature/...`, `fix/...`.  
- **Do not** patch on top of obviously broken code—rebuild the region cleanly.

**Why this matters:** Prevents “patch‑over‑patch” chaos and regression loops.

---

## 5) Section/Function Markers (Surgical Replacements)

Wrap meaningful regions so we can replace them precisely.

**HTML**
```html
<!-- [SECTION START] header-nav v1 -->
  ...content...
<!-- [SECTION END] header-nav v1 -->
```

**CSS**
```css
/* [BLOCK START] .site-header v1 */
/* styles */
/* [BLOCK END] .site-header v1 */
```

**JavaScript**
```js
// [FUNC START] buildNav() v1
function buildNav() { /* ... */ }
// [FUNC END] buildNav() v1
```

**Rules**
- No nested markers.  
- Stable, human‑readable tag names (`header-nav`, `buildNav()` …).  
- Optional version in marker (bump for significant rewrites).

**Regex select (Notepad++ → Search Mode: Regular expression):**
```regex
# Example for a JS function block:
\/\/ \[FUNC START\] buildNav\(\) v1(?s).*?\/\/ \[FUNC END\] buildNav\(\) v1
```

**Why this matters:** You can paste a replacement across a single, known region without touching the rest of the file.

---

## 6) Code Delivery Rules (Markers vs Full Files)

- **Default:** Provide **Replacement Packs** between the correct START/END markers.  
  - The pack **must repeat** the exact opening/closing marker lines.  
  - Always state **file path** and **marker tag**.
- **Fallback:** If multiple regions or structure change, provide **full replacement file(s)** and explain why markers weren’t used.

**Every code answer must include:**
- Which files and markers it targets.  
- Replacement Pack(s) **or** full file(s).  
- A **Conventional Commit message**.  
- **Manual test steps** (how to verify).  
- A **rollback note** if risk is high.

**Why this matters:** Small, safe edits by default—and clear instructions when bigger changes are necessary.

---

## 7) Automatic Version Badges (pre‑commit hook)

- Badge format near the top of each page:  
  `Version vX.Y.Z (pageTag)`  
- The **pre‑commit hook** bumps the **patch** for **staged `.html` files** or inserts a `v0.0.1` badge if missing.  
- You can manually change **major/minor**; the hook continues from there.

**Why this matters:** Per‑page visibility of what version is live, without manual edits.

---

## 8) Chat Behavior Rules (Beginner‑first)

When a new development chat starts **(or when commanded “Load project bootstrap”)**, the assistant must:

1. **Ask clarifying questions first** (scope, files/markers, constraints, success criteria).  
2. **Summarize the plan** and **wait for explicit confirmation** before coding.  
3. Default to **marker‑based Replacement Packs**; use full files only when necessary.  
4. Provide **beginner‑level, step‑by‑step instructions** and quick **checklists**.  
5. Include the **commit message** (Conventional), **manual test steps**, and any **rollback note**.

### PROJECT BOOTSTRAP (embed this in new chats if needed)
```
PROJECT BOOTSTRAP
Tech: Plain HTML/CSS/JS
Repo: https://github.com/sjones321/civ7-tracker
Live: https://sjones321.github.io/civ7-tracker/
Guide: https://github.com/sjones321/civ7-tracker/blob/main/docs/workflow_guide.md

User is a BEGINNER for coding/Git/web: provide clear, step-by-step instructions by default.

Rules:
- Ask clarifying questions and summarize; wait for my explicit “OK” before coding.
- Prefer marker-based Replacement Packs; include exact START/END lines.
- Only modify requested scope; keep existing behavior elsewhere.
- Use alt text, visible focus, and semantic HTML.
- Include per-page version badge updates (hook will bump patch for staged HTML).
- Generate a Conventional Commit message + manual test steps.

Ask me: “What’s today’s single, specific task?”
Then confirm scope (file paths, marker tags, constraints) before writing code.
```

**Why this matters:** Every chat runs in the same predictable, beginner‑friendly way.

---

## 9) Voice Brainstorm Summary (paste after voice sessions)

```
VOICE SUMMARY (dd mmm yyyy)
Topic:
Goals / Decisions (mark LOCKED vs TENTATIVE):
- [LOCKED] ...
- [TENTATIVE] ...
Constraints:
- ...
First Task Candidates:
- ...
Open Questions:
- ...
Next Actions:
1) ...
2) ...
Requested Files/Outputs:
- ...
```

**Why this matters:** Converts fast voice ideas into a written plan we can execute here.

---

## 10) Rebuild / Reset Procedure

- Create branch: `rebuild/base`  
- Clean structure:
  ```
  index.html
  /css/base.css
  /js/main.js
  /img
  ```
- Rebuild clean; add features incrementally; tag stable points (`v0.2-base-stable`, etc.).

**Why this matters:** You escape legacy bugs and regain control of structure.

---

## 11) Notepad++ Quick Settings

- **File Status Auto‑Detection:** Settings → Preferences → **MISC** → enable both checkboxes.  
- **Keep session (optional):** Settings → Preferences → **Backup** → Remember current session.  
- **Compare plugin** (optional) for side‑by‑side diffs.

**Why this matters:** Files reload after pulls; you keep your place between sessions.

---

## 12) Task Kickoff Prompt (copy/paste)

Use this to start any new task in a chat:

```
TASK KICKOFF
Project: CIV7 Tracker
Scope: <describe the single, specific element/feature>
Files/Markers: <file path(s) + marker tags if known>
Constraints: <performance, accessibility, mobile, etc.>
Success Criteria: <what I should see working>

Please:
1) Ask clarifying questions if needed.
2) Summarize your plan and wait for my OK.
3) Deliver a marker-based Replacement Pack (or explain why a full file is needed).
4) Provide a Conventional Commit message and manual test steps.
```

**Why this matters:** Forces a thoughtful start and prevents “gung‑ho” code that misses context.
