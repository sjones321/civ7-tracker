@echo off
setlocal
REM Run from this .bat's folder
cd /d "%~dp0"

REM Call PowerShell with safe flags, run today's devlog, then exit
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-devlog.ps1"
endlocal
