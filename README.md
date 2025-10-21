# 🌍 CIV7 Tracker

A lightweight static website to track **Civilization VII** meta‑game progress, wonders, natural wonders, independent peoples, and more.

---

## 🔗 Quick Links

| Resource | URL |
|-----------|-----|
| **Live Site** | [https://sjones321.github.io/civ7-tracker/](https://sjones321.github.io/civ7-tracker/) |
| **GitHub Repo** | [https://github.com/sjones321/civ7-tracker](https://github.com/sjones321/civ7-tracker) |
| **Workflow Guide** | [docs/workflow_guide.md](./docs/workflow_guide.md) |

---

## 🚀 Launch Command (for ChatGPT integration)

When starting a **new chat** about this project, type:

> **`Load project bootstrap`**

This will automatically load and follow your `/docs/workflow_guide.md`, ensuring beginner‑mode instructions, marker‑based edits, and consistent commit/test procedures.

---

## 🧰 Project Setup

### Folder structure
```
/ (repo root)
  index.html
  /css/base.css
  /js/main.js
  /img/
  /docs/workflow_guide.md
  .githooks/
  .gitignore
  README.md
```

### Requirements
- [Git for Windows](https://gitforwindows.org/) installed and on PATH  
- [GitKraken](https://www.gitkraken.com/) using **system Git** (not bundled)  
- [Notepad++](https://notepad-plus-plus.org/) for editing  
- GitHub Pages enabled for branch `main`, folder `/root`  

### Optional
- **Compare plugin** in Notepad++ for quick diffs  
- Local `.githooks` folder with `pre-commit` auto‑version script (included in repo)

---

## 🧩 Developer Workflow Summary

1. Edit files in Notepad++ → **Save**  
2. GitKraken → **Stage → Commit → Push**  
3. Pre‑commit hook auto‑bumps the patch version in staged `.html` files  
4. Hard refresh live site (`Ctrl+F5`) → verify updated badge  
5. When starting a coding session in ChatGPT → run **`Load project bootstrap`**

---

## 🧭 Commands & Shortcuts

| Action | Command / Steps |
|--------|-----------------|
| Load project rules in ChatGPT | `Load project bootstrap` |
| Initialize hooks (once) | `git config core.hooksPath .githooks` |
| Verify hooks path | `git config --get core.hooksPath` |
| Hard refresh live site | `Ctrl + F5` |
| Create rebuild branch | `git checkout -b rebuild/base` |
| Example commit | `feat(header): add responsive nav toggle` |
| Example voice summary header | `VOICE SUMMARY (21 Oct 2025)` |

---

## 🧠 Tips

- **Always use markers**: wrap major sections with `[START]/[END]` comments so edits can be swapped cleanly.  
- **Keep commits small**: one feature or fix per commit.  
- **Use beginner‑mode commands**: step‑by‑step saves time.  
- **When in doubt**: say “Load project bootstrap” again to re‑sync.

---

## 📜 License

MIT License © 2025 Stephen Jones  
See [LICENSE](LICENSE) if you add one later.

---

**Made with patience and persistence.**
