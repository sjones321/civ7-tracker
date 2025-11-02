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

# Build today's file path
$today = Get-Date -Format "yyyy-MM-dd"
$file  = Join-Path $logDir "$today.md"

# Create header if file doesn't exist (lint-safe: blank line after quote)
if (-not (Test-Path $file)) {
@"
# 📚 Learning Log — $today

> Quick notes from today’s learning experiments. Added via prompt helper.

"@ | Out-File -Encoding UTF8 $file
}

# Append entry (lint-safe: blank line before H2 and trailing newline)
$time = (Get-Date).ToString("HH:mm")
$entry = @"
## $time — $Title

$Note

"@

Add-Content -Encoding UTF8 -Path $file -Value $entry

Write-Host "✅ Appended entry to $file"
