# install-devlog-shortcuts.ps1
# Creates Start Menu shortcuts for the dev log helpers.

$ErrorActionPreference = "Stop"

# Resolve paths
$root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$batToday  = Join-Path $root "new-devlog-today.bat"
$batDate   = Join-Path $root "new-devlog-date.bat"

# Validate existence
foreach ($p in @($batToday, $batDate)) {
  if (!(Test-Path $p)) {
    Write-Error "Missing file: $p  (make sure the .bat files are next to this script)"
  }
}

# Start Menu\Programs folder for current user
$startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"

# Helper to create a .lnk
function New-Shortcut($target, $shortcutName, $iconPath=$null) {
  $wshell = New-Object -ComObject WScript.Shell
  $lnk    = $wshell.CreateShortcut((Join-Path $startMenu "$shortcutName.lnk"))
  $lnk.TargetPath       = $target
  $lnk.WorkingDirectory = (Split-Path $target)
  $lnk.WindowStyle      = 7   # Minimized
  if ($iconPath -and (Test-Path $iconPath)) { $lnk.IconLocation = $iconPath }
  $lnk.Save()
}

# Try to use Notepad++ icon if present, otherwise cmd.exe
$npIcon = "$Env:ProgramFiles\Notepad++\notepad++.exe"
if (!(Test-Path $npIcon)) { $npIcon = "$env:SystemRoot\System32\cmd.exe" }

# Create the shortcuts
New-Shortcut -target $batToday -shortcutName "CIV7 – New Dev Log (Today)" -iconPath $npIcon
New-Shortcut -target $batDate  -shortcutName "CIV7 – New Dev Log (Pick Date)" -iconPath $npIcon

Write-Host "Shortcuts created in Start menu. Open Start and type 'CIV7' to find them."
