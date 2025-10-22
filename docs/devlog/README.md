# 📘 CIV7 Tracker — Developer Log

This folder stores one **daily summary** per file, named by date: `YYYY-MM-DD.md`.

## How to add a new entry (Windows, PowerShell)

```powershell
# From repo root, create today's file and open in Notepad++
$today = Get-Date -Format 'yyyy-MM-dd'
$new = "docs/devlog/$today.md"
if (!(Test-Path "docs/devlog")) { New-Item -ItemType Directory -Path "docs/devlog" | Out-Null }
@"
# 🌙 CIV7 Tracker — End of Day Summary

**Date:** $today
**Focus:** <what you worked on>

---

## ✅ Accomplishments

- ...

## ⚙️ Next Planned Phase

- ...

## 🧠 Reflection

- ...

"@ | Set-Content -Path $new -Encoding utf8

notepad++ $new
```

## Tips

- Keep each entry focused and brief (5–15 bullets total).  
- Link to relevant commits or PRs if helpful.  
- Future chats should scan the latest file here to regain context quickly.
