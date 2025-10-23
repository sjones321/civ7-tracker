# START PACK: pre-commit.ps1 (v2.1 - friendlier logging + autofix)
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path .).Path
$logDir   = Join-Path $repoRoot '.githooks'
$logFile  = Join-Path $logDir  'pre-commit.log'
$mdOut    = Join-Path $logDir  'markdownlint.out'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

function Log([string]$msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  ($ts + '  ' + $msg) | Out-File -FilePath $logFile -Append -Encoding UTF8
  Write-Host $msg
}

# --- TASK 1: Update docs/site.json buildDate ---
try {
  $siteJsonPath = Join-Path $repoRoot 'docs\site.json'
  if (Test-Path $siteJsonPath) {
    try {
      $raw = Get-Content -Raw -Encoding UTF8 $siteJsonPath
      $obj = $raw | ConvertFrom-Json  # will throw if invalid
    } catch {
      Log "ERROR: docs/site.json is invalid JSON. $_"
      Write-Error "docs/site.json is invalid JSON. Open it and remove any comments or stray text."
      exit 2
    }

    $today = (Get-Date).ToString('yyyy-MM-dd')
    $obj.buildDate = $today

    $jsonOut = $obj | ConvertTo-Json -Depth 4
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($siteJsonPath, $jsonOut + "`n", $utf8NoBom)
    Log ("Updated docs/site.json buildDate => " + $today)
  } else {
    Log 'INFO: docs/site.json not found; skipping shared version refresh.'
  }
}
catch {
  Log ('WARNING: site.json step failed: ' + $_.Exception.Message)
  # non-fatal
}

# --- TASK 2: Markdownlint (autofix then verify, Windows-safe) ---
Log 'Running markdownlint --fix via cmd.exe npx...'
# First pass: try to fix
$fixCmd = 'npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**" --fix'
$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $fixCmd -Wait -PassThru -NoNewWindow
$fixCode = $proc.ExitCode

# Second pass: verify clean and capture output
$verifyCmd = 'npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"'
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'cmd.exe'
$psi.Arguments = '/c ' + $verifyCmd + ' > "' + $mdOut + '" 2>&1'
$psi.UseShellExecute = $false
$psi.CreateNoWindow  = $true
$p = [System.Diagnostics.Process]::Start($psi); $p.WaitForExit()
$verifyCode = $p.ExitCode

if ($verifyCode -ne 0) {
  Log ('markdownlint failed with exit code ' + $verifyCode + '. See ' + $mdOut)
  Write-Error "markdownlint failed. Open $mdOut for exact lines to fix."
  exit $verifyCode
}

Log 'All checks passed.'
exit 0
# END PACK: pre-commit.ps1 (v2.1 - friendlier logging + autofix)
