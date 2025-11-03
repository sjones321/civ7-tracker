:: CIV7 Tracker - Stream Deck Launcher
:: Runs silently, closes existing servers, starts new one, opens Chrome
@echo off
setlocal EnableDelayedExpansion

:: Optional first arg = port (default 8080)
set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

:: Repo root = folder where this script lives
set "ROOT=%~dp0"

:: Kill any existing processes on this port (silent)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Start server in minimized window (background)
pushd "%ROOT%"
start /MIN "" cmd /c "npx.cmd --yes http-server -p %PORT% >nul 2>&1"
popd

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Open Chrome in new window
start "" "chrome.exe" --new-window "http://localhost:%PORT%/"

endlocal
