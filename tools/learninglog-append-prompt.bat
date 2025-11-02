:: --- tools/learninglog-append-prompt.bat ---
@echo off
setlocal

set "HERE=%~dp0"
pushd "%HERE%\.."

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File ".\tools\learninglog-append-prompt.ps1"
if errorlevel 1 (
  echo.
  echo Script reported an error. Press any key to close...
  pause >nul
)
set EXITCODE=%ERRORLEVEL%

popd
exit /b %EXITCODE%
