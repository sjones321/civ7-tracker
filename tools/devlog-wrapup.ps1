<#
.SYNOPSIS
    Display the daily summary block for a devlog entry.
.DESCRIPTION
    Reads the DAILY SUMMARY fenced block from docs/devlog/YYYY-MM-DD.md,
    prints the bullet list for quick wrap-up posts, and copies it to the clipboard
    when available. Optionally opens the devlog file for review.
.PARAMETER Date
    Target date (yyyy-MM-dd). Defaults to today.
.PARAMETER NoOpen
    Suppress opening the devlog file after generating the summary.
#>
[CmdletBinding()]
param(
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
    [switch]$NoOpen
)

function Get-RepoRoot {
    param([string]$Path)
    $scriptDir = Split-Path -Parent $Path
    return Split-Path -Parent $scriptDir
}

$repoRoot = Get-RepoRoot -Path $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$devlogPath = Join-Path $repoRoot "docs/devlog/$Date.md"
if (-not (Test-Path $devlogPath)) {
    throw "Devlog not found: $devlogPath"
}

$content = Get-Content -Path $devlogPath -Raw -Encoding utf8
$pattern = "(?s)<!-- DAILY SUMMARY START -->\\s*```md\\s*(.*?)\\s*```\\s*<!-- DAILY SUMMARY END -->"
$summaryLines = @()

if ($content -match $pattern) {
    foreach ($line in ($Matches[1] -split "`r?`n")) {
        $trimmed = $line.Trim()
        if ($trimmed) {
            $summaryLines += $trimmed
        }
    }
} else {
    throw 'No DAILY SUMMARY block found. Run tools/devlog-append first.'
}

if ($summaryLines.Count -eq 0) {
    throw 'The DAILY SUMMARY block is empty.'
}

$summaryText = $summaryLines -join "`n"

Write-Host "Daily Summary for $Date" -ForegroundColor Cyan
Write-Host '-------------------------' -ForegroundColor Cyan
Write-Host $summaryText
Write-Host '-------------------------' -ForegroundColor Cyan
Write-Host "Source: docs/devlog/$Date.md" -ForegroundColor DarkGray

try {
    Set-Clipboard -Value $summaryText
    Write-Host 'Copied summary to clipboard.' -ForegroundColor Green
} catch {
    Write-Warning "Clipboard copy failed: $($_.Exception.Message)"
}

if (-not $NoOpen) {
    $np = "${env:ProgramFiles}\Notepad++\notepad++.exe"
    if (Test-Path $np) {
        & $np $devlogPath
    } else {
        Invoke-Item $devlogPath
    }
}
