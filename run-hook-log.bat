@echo on
setlocal ENABLEEXTENSIONS

REM ===============================================
REM  CIV7 Tracker — Pre-commit Hook Logger (v7)
REM  - No Tee-Object, no Transcript, no locks
REM  - Plain stdout+stderr redirection to a temp file
REM  - Copies to .git\hooks-log\ and opens it
REM ===============================================

REM 1) Force working dir to the repo root (where this .bat lives)
cd /d "%~dp0"
echo [INFO] Running from: %CD%

REM 2) Basic checks
if not exist ".git" (
  echo [ERROR] .git not found here. Open the repo root and run again.
  pause & exit /b 1
)
if not exist ".githooks\pre-commit.ps1" (
  echo [ERROR] Missing .githooks\pre-commit.ps1
  pause & exit /b 1
)

REM 3) Paths
if not exist ".git\hooks-log" mkdir ".git\hooks-log" >nul 2>&1
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToString(\"yyyy-MM-dd_HH-mm-ss\")"') do set "TS=%%I"
set "BASENAME=precommit_%TS%.txt"
set "TEMPLOG=%TEMP%\%BASENAME%"
set "REPOLOG=.git\hooks-log\%BASENAME%"

echo [INFO] Temp log:  %TEMPLOG%
echo [INFO] Repo log:  %REPOLOG%

REM 4) Run the hook and capture ALL output (stdout+stderr) to the temp log
where powershell >nul 2>&1 || (echo [ERROR] PowerShell not found & pause & exit /b 1)

powershell -NoProfile -ExecutionPolicy Bypass -File ".githooks\pre-commit.ps1" > "%TEMPLOG%" 2>&1
set "CODE=%ERRORLEVEL%"
echo [INFO] Hook exit code: %CODE%

REM 5) Copy the temp log into the repo (retry a few times for OneDrive)
set "COPIED=0"
for /L %%R in (1,1,5) do (
  copy /Y "%TEMPLOG%" "%REPOLOG%" >nul 2>&1
  if exist "%REPOLOG%" ( set "COPIED=1" & goto :copied )
  echo [WARN] Copy attempt %%R failed; retrying...
  ping -n 2 127.0.0.1 >nul
)

:copied
if "%COPIED%"=="1" (
  echo [OK] Log saved to: %REPOLOG%
  start notepad "%REPOLOG%"
) else (
  echo [ERROR] Could not copy to repo. Opening temp log instead.
  start notepad "%TEMPLOG%"
)

echo.
if "%CODE%"=="0" ( echo [OK] Hook completed successfully. ) else ( echo [FAIL] Hook exited with code %CODE%. )
echo.
pause
exit /b %CODE%
