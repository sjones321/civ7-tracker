# new-devlog.ps1
# Creates docs/devlog/YYYY-MM-DD.md with a template and a Commit Digest for today (or a given date).

param(
  [string]$Date = (Get-Date -Format 'yyyy-MM-dd')
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$devlogDir = Join-Path $root "docs/devlog"
if (!(Test-Path $devlogDir)) { New-Item -ItemType Directory -Path $devlogDir | Out-Null }

$path = Join-Path $devlogDir "$Date.md"

$since = [datetime]::ParseExact($Date,'yyyy-MM-dd',$null)
$until = $since.AddDays(1)
$sinceIso = $since.ToString("yyyy-MM-ddT00:00:00")
$untilIso = $until.ToString("yyyy-MM-ddT00:00:00")

$commitDigest = ""
try {
  $commitDigest = git log --since="$sinceIso" --until="$untilIso" --pretty=format:"- %h %ad %s" --date=short 2>$null
} catch { }

$commitSection = @"
## 📜 Commit Digest ($Date)

$commitDigest

"@

if (!(Test-Path $path)) {
  $content = @"
# 🌙 CIV7 Tracker — End of Day Summary

**Date:** $Date  
**Focus:** <what we focused on today>

---

## ✅ Accomplishments

- ...

## ⚙️ Next Planned Phase

- ...

## 🧠 Reflection

- ...

$commitSection
"@
  Set-Content -Path $path -Value $content -Encoding utf8
} else {
  Add-Content -Path $path -Value "`n$commitSection" -Encoding utf8
}

$np = "${env:ProgramFiles}\Notepad++\notepad++.exe"
if (Test-Path $np) {
  & $np $path
} else {
  Invoke-Item $path
}

Write-Host "Dev log ready: $path"
