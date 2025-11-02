# --- tools/learninglog-append-prompt.ps1 ---
# Interactive: asks for Title, opens Notepad for multi-line Note,
# appends to docs/learninglog/YYYY-MM-DD.md with clean spacing (MD012/MD022 safe).

$ErrorActionPreference = "Stop"

# Resolve repo root (tools\ -> repo root)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Split-Path $scriptDir
Set-Location $repoRoot

# Ensure log directory
$logDir = Join-Path $repoRoot "docs\learninglog"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

# Title prompt
$title = ""
while ([string]::IsNullOrWhiteSpace($title)) {
  $title = Read-Host "Learning Title (short and clear)"
}

Write-Host ""
Write-Host "Notepad will open for your detailed note."
Write-Host "Save and close Notepad to append the entry."
Write-Host ""

# Temp file for multi-line note
$tmp = Join-Path $env:TEMP "learninglog-note.txt"
"Type your note here. Replace this line." | Out-File -Encoding UTF8 $tmp
Start-Process -FilePath "notepad.exe" -ArgumentList "`"$tmp`"" -Wait

# Read note
$note = (Get-Content -Raw -Encoding UTF8 $tmp).Trim()
if ([string]::IsNullOrWhiteSpace($note)) {
  Write-Warning "No note content detected. Nothing appended."
  exit 1
}

# Target file
$today = Get-Date -Format "yyyy-MM-dd"
$file  = Join-Path $logDir "$today.md"

# Create header if missing (clean single newline at end)
if (-not (Test-Path $file)) {
@"
# 📚 Learning Log — $today

> Quick notes from today’s learning experiments. Added via prompt helper.

"@ | Out-File -Encoding UTF8 $file
}

# Normalize trailing newlines to exactly one
$existing = Get-Content -Raw -Encoding UTF8 $file
$normalized = $existing -replace "(\r?\n)+$","`r`n"
Set-Content -Path $file -Value $normalized -NoNewline -Encoding UTF8

# Build entry (no leading newline here)
$time = (Get-Date).ToString("HH:mm")
$entry = @"
## $time — $title

$note
"@

# Append with exactly one blank line before the H2
Add-Content -Encoding UTF8 -Path $file -Value "`r`n$entry"

Write-Host ""
Write-Host "✅ Appended to: $file"
Write-Host ""
