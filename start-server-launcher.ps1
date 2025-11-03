# CIV7 Tracker - Stream Deck Launcher (PowerShell version)
# Runs silently, closes existing servers, starts new one, opens Chrome

param(
    [int]$Port = 8080
)

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Kill any existing servers on the port
Write-Host "Checking for existing server on port $Port..." -NoNewline
$processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host " Found $(@($processes).Count) process(es)"
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Closed process $pid"
        } catch {
            # Ignore errors if process already closed
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "Port cleared."
} else {
    Write-Host " None found."
}

# Start server in background
Write-Host "Starting server on port $Port..."
Push-Location $RepoRoot
$job = Start-Job -ScriptBlock {
    param($Port)
    Set-Location $using:RepoRoot
    npx --yes http-server -p $Port *> $null
} -ArgumentList $Port

# Wait for server to start
Start-Sleep -Seconds 3

# Open Chrome
Write-Host "Opening Chrome..."
Start-Process "chrome.exe" -ArgumentList "--new-window","http://localhost:$Port/"

# Keep job running (don't wait for it)
Write-Host "Server started! Close this window or press Ctrl+C to stop."
Write-Host "Server will continue running in background."

# Wait for user to stop (or leave it running)
try {
    Wait-Job $job
} catch {
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
}

Pop-Location

