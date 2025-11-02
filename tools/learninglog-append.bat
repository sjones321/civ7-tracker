# --- tools/learninglog-append.ps1 ---
param(
  [Parameter(Mandatory=$true)][string]$Title,
  [Parameter(Mandatory=$true)][string]$Note
)

$ErrorActionPreference = "Stop"

# Resolve repo root (tools\ -> repo root)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Split-Path $scriptDir
Set-Location $repoRoot

# Ensure log directory
$logDir = Join-Path $repoRoot "docs\learninglog"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

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
## $time — $Title

$Note
"@

# Append with exactly one blank line before the H2
Add-Content -Encoding UTF8 -Path $file -Value "`r`n$entry"

Write-Host "✅ Appended entry to $file"
