<# 
pre-commit.ps1 — CIV7 Tracker (CMD-based npx call)
- Processes staged .html files (badge insert/bump)
- Re-stages changed files
- Runs markdownlint using 'cmd.exe /c npx ...' to avoid PowerShell npx.ps1 wrapper issues
#>

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path .).Path
$logFile  = Join-Path $repoRoot '.githooks\pre-commit.log'

function Log([string]$msg) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  ($ts + '  ' + $msg) | Out-File -FilePath $logFile -Append -Encoding UTF8
  Write-Host $msg
}

# Get staged HTML files
$staged = git diff --cached --name-only --diff-filter=ACM 2>$null
if ($LASTEXITCODE -ne 0) {
  Log 'ERROR: git not available or not a repository.'
  exit 1
}
$staged = $staged | Where-Object { $_ -match '\.html?$' }

if (-not $staged) {
  Log 'No staged HTML files — skipping badge step.'
} else {
  Log ('Processing staged HTML files: ' + ($staged -join ', '))
}

# Badge regex
$pattern = '<div\s+id="version-badge"[^>]*>Version\s+v(\d+)\.(\d+)\.(\d+)\s*\(([^)]*)\)</div>'
$regex   = [System.Text.RegularExpressions.Regex]::new($pattern,[System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

$changed = @()

foreach ($rel in $staged) {
  $path = Join-Path $repoRoot $rel
  if (-not (Test-Path -LiteralPath $path)) { continue }
  $fileName = Split-Path $path -Leaf

  $content = [System.IO.File]::ReadAllText($path, (New-Object System.Text.UTF8Encoding($false)))

  $m = $regex.Match($content)
  if ($m.Success) {
    $maj = [int]$m.Groups[1].Value
    $min = [int]$m.Groups[2].Value
    $pat = [int]$m.Groups[3].Value + 1
    $next = ('{0}.{1}.{2}' -f $maj, $min, $pat)

    $newBadge = ('<div id="version-badge" class="visually-muted">Version v{0} ({1})</div>' -f $next, $fileName)
    $content = $regex.Replace($content, { param([System.Text.RegularExpressions.Match] $mm) $newBadge }, 1)
    Log ('Bumped version in ' + $rel + ' to v' + $next)
  } else {
    $insert = ('<div id="version-badge" class="visually-muted">Version v0.0.1 ({0})</div>' -f $fileName)
    if ([System.Text.RegularExpressions.Regex]::IsMatch($content, '</body>', 'IgnoreCase')) {
      $content = [System.Text.RegularExpressions.Regex]::Replace($content, '</body>', ($insert + "`r`n</body>"), 1, 'IgnoreCase')
      Log ('Inserted badge in ' + $rel)
    } else {
      $content = $content + "`r`n" + $insert + "`r`n"
      Log ('Appended badge to end of ' + $rel)
    }
  }

  [System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
  git add -- "$rel" | Out-Null
  $changed += $rel
}

if ($changed.Count -gt 0) {
  Log ('Re-staged files: ' + ($changed -join ', '))
}

# markdownlint via CMD npx shim (avoids PowerShell npx.ps1 and $MyInvocation.Statement)
Log 'Running markdownlint via cmd.exe npx...'
$cmdline = 'npx --yes markdownlint-cli "**/*.md" --ignore node_modules --ignore "lychee/**"'
$process = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $cmdline -Wait -PassThru -NoNewWindow
$code = $process.ExitCode

if ($code -ne 0) {
  Log ('markdownlint failed with exit code ' + $code)
  Write-Error 'markdownlint failed. See .githooks\pre-commit.log for details.'
  exit $code
}

Log 'All checks passed.'
exit 0
