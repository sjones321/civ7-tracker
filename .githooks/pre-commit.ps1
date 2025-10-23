# START PACK: pre-commit.ps1 (v2 - shared versioning)
<# 
CIV7 Tracker — Pre-commit hook
- Updates docs/site.json buildDate (keeps version as-is)
- Runs markdownlint via cmd.exe npx shim
- No HTML scanning or badge rewriting anymore
#>

$ErrorActionPreference = 'Stop'

# --- Paths & logging ---
$repoRoot = (Resolve-Path .).Path
$logFile  = Join-Path $repoRoot '.githooks\pre-commit.log'
function Log([string]$msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  ($ts + '  ' + $msg) | Out-File -FilePath $logFile -Append -Encoding UTF8
  Write-Host $msg
}

# --- TASK 1: Update docs/site.json buildDate ---
# START PATCH: shared version data (docs/site.json)
try {
  $siteJsonPath = Join-Path $repoRoot 'docs\site.json'
  if (Test-Path $siteJsonPath) {
    $raw = Get-Content -Raw -Encoding UTF8 $siteJsonPath
    $obj = $raw | ConvertFrom-Json

    $today = (Get-Date).ToString('yyyy-MM-dd')
    $obj.buildDate = $today

    $jsonOut = $obj | ConvertTo-Json -Depth 4
    # Write UTF-8 (no BOM) with trailing newline
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($siteJsonPath, $jsonOut + "`n", $utf8NoBom)

    Log ("Updated docs/site.json buildDate => " + $today)
  } else {
    Log 'INFO: docs/site.json not found; skipping shared version refresh.'
  }
}
catch {
  Log ('WARNING: Could not update docs/site.json. ' + $_.Exception.Message)
  # Non-fatal — don’t block commit
}
# END PATCH: shared version data (docs/site.json)

# --- TASK 2: Markdownlint via CMD npx (stable on Windows) ---
# START PATCH: markdownlint
Log 'Running markdownlint via cmd.exe npx...'
$cmdline = 'npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"'
$process = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $cmdline -Wait -PassThru -NoNewWindow
$code = $process.ExitCode
if ($code -ne 0) {
  Log ('markdownlint failed with exit code ' + $code)
  Write-Error 'markdownlint failed. See .githooks\pre-commit.log for details.'
  exit $code
}
# END PATCH: markdownlint

Log 'All checks passed.'
exit 0
# END PACK: pre-commit.ps1 (v2 - shared versioning)
