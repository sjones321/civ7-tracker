<#
.SYNOPSIS
    Append a devlog entry and daily summary bullet for a given date.
.DESCRIPTION
    Ensures docs/devlog/YYYY-MM-DD.md exists, appends a summary bullet between the
    DAILY SUMMARY markers, and adds/updates a matching bullet under "## ✅ Accomplishments".
    Existing entries are preserved and duplicates are ignored.
.PARAMETER Date
    Target date (yyyy-MM-dd). Defaults to today.
.PARAMETER Title
    One-line title for the entry.
.PARAMETER Description
    Supporting description appended after an em dash.
.EXAMPLE
    ./tools/devlog-append.ps1 -Title "docs: close missing code fence" -Description "Annotated the snippet block".
#>
[CmdletBinding()]
param(
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd'),
    [string]$Title,
    [string]$Description
)

function Get-RepoRoot {
    param([string]$Path)
    $scriptDir = Split-Path -Parent $Path
    return Split-Path -Parent $scriptDir
}

$repoRoot = Get-RepoRoot -Path $MyInvocation.MyCommand.Path
Set-Location $repoRoot

if (-not $Title) {
    $Title = Read-Host 'Entry title'
}
if (-not $Description) {
    $Description = Read-Host 'Entry description'
}

if ([string]::IsNullOrWhiteSpace($Title)) {
    throw 'Title cannot be empty.'
}
if ([string]::IsNullOrWhiteSpace($Description)) {
    throw 'Description cannot be empty.'
}

$devlogDir = Join-Path $repoRoot 'docs/devlog'
if (-not (Test-Path $devlogDir)) {
    New-Item -ItemType Directory -Path $devlogDir | Out-Null
}

$devlogPath = Join-Path $devlogDir "$Date.md"
$newDevlogScript = Join-Path $repoRoot 'new-devlog.ps1'
if (-not (Test-Path $devlogPath)) {
    if (Test-Path $newDevlogScript) {
        & $newDevlogScript -Date $Date | Out-Null
    } else {
        throw "Missing devlog file and generator script: $newDevlogScript"
    }
}

$content = Get-Content -Path $devlogPath -Raw -Encoding utf8

$summaryStart = '<!-- DAILY SUMMARY START -->'
$summaryEnd = '<!-- DAILY SUMMARY END -->'
$summaryEntry = "- $Title — $Description"
$summaryPattern = "(?s)<!-- DAILY SUMMARY START -->\\s*```md\\s*(.*?)\\s*```\\s*<!-- DAILY SUMMARY END -->"

if ($content -match $summaryPattern) {
    $existingSummary = $Matches[1]
    $summaryLines = @()
    foreach ($line in ($existingSummary -split "`r?`n")) {
        $trimmed = $line.Trim()
        if ($trimmed) {
            if ($summaryLines -notcontains $trimmed) {
                $summaryLines += $trimmed
            }
        }
    }
    if ($summaryLines -notcontains $summaryEntry) {
        $summaryLines = @($summaryEntry) + $summaryLines
    }
    $newSummaryBlock = @(
        $summaryStart,
        '```md',
        ($summaryLines -join "`n"),
        '```',
        $summaryEnd
    ) -join "`n"
    $content = [regex]::Replace($content, $summaryPattern, [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            return $newSummaryBlock
        }, 1)
} else {
    $summaryBlock = @(
        $summaryStart,
        '```md',
        $summaryEntry,
        '```',
        $summaryEnd,
        ''
    ) -join "`n"
    $content = "$summaryBlock`n$content"
}

$accomplishmentsHeading = '## ✅ Accomplishments'
$headingIndex = $content.IndexOf($accomplishmentsHeading)
if ($headingIndex -ge 0) {
    $afterHeadingIndex = $headingIndex + $accomplishmentsHeading.Length
    $afterHeading = $content.Substring($afterHeadingIndex)
    $nextHeadingPos = $afterHeading.IndexOf("`n## ")
    if ($nextHeadingPos -ge 0) {
        $sectionBody = $afterHeading.Substring(0, $nextHeadingPos)
        $rest = $afterHeading.Substring($nextHeadingPos)
    } else {
        $sectionBody = $afterHeading
        $rest = ''
    }

    $existingBullets = @()
    foreach ($line in ($sectionBody -split "`r?`n")) {
        $trim = $line.Trim()
        if ($trim.StartsWith('- ')) {
            if ($existingBullets -notcontains $trim) {
                $existingBullets += $trim
            }
        }
    }
    if ($existingBullets -notcontains $summaryEntry) {
        $existingBullets = @($summaryEntry) + $existingBullets
    }

    $joinedBullets = $existingBullets -join "`n`n"
    $restTrimmed = $rest
    while (-not [string]::IsNullOrEmpty($restTrimmed) -and ($restTrimmed.StartsWith("`r") -or $restTrimmed.StartsWith("`n"))) {
        $restTrimmed = $restTrimmed.Substring(1)
    }

    if ([string]::IsNullOrEmpty($restTrimmed)) {
        $replacement = "`n`n$joinedBullets`n"
    } else {
        $replacement = "`n`n$joinedBullets`n`n$restTrimmed"
    }

    $content = $content.Substring(0, $afterHeadingIndex) + $replacement
} else {
    Write-Warning 'Could not find the "## ✅ Accomplishments" section to update.'
}

Set-Content -Path $devlogPath -Value $content -Encoding utf8

$np = "${env:ProgramFiles}\Notepad++\notepad++.exe"
if (Test-Path $np) {
    & $np $devlogPath
} else {
    Invoke-Item $devlogPath
}

Write-Host "Logged entry '$Title' for $Date." -ForegroundColor Green
