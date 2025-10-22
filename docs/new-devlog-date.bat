@echo off
setlocal
cd /d "%~dp0"

set /p DEVLOG_DATE=Enter date (YYYY-MM-DD) or leave blank for today: 

if "%DEVLOG_DATE%"=="" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-devlog.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-devlog.ps1" -Date %DEVLOG_DATE%
)

endlocal