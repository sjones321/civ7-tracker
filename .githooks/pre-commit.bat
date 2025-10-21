@echo off
REM Git pre-commit hook launcher (Windows)
REM Runs a PowerShell script that auto-bumps per-page HTML version badges.

powershell -ExecutionPolicy Bypass -File "%~dp0pre-commit.ps1"
IF %ERRORLEVEL% NEQ 0 (
  echo Pre-commit hook failed. Aborting commit.
  exit /b %ERRORLEVEL%
)
