@echo off
setlocal ENABLEDELAYEDEXPANSION

REM ===============================================================
REM  CIV7 Tracker — Project File Sync (ChatGPT upload helpers) v2
REM  Place this .bat ONE LEVEL ABOVE your repo folder.
REM  Usage:
REM     Double-click  (auto-detects repo)
REM     or: project-file-sync.bat "C:\path\to\civ7-tracker"
REM ===============================================================

REM 0) Resolve repo root
set "REPO="
if not "%~1"=="" (
  set "REPO=%~1"
) else (
  set "REPO=%~dp0civ7-tracker"
)

if not exist "%REPO%\.git" (
  for /d %%D in ("%~dp0*") do (
    if exist "%%~fD\.git" (
      set "REPO=%%~fD"
      goto :repo_found
    )
  )
) else (
  goto :repo_found
)

echo [ERROR] Could not locate a git repo. Pass path as the first argument or ensure the repo is a sibling.
echo         Example: project-file-sync.bat "C:\Users\you\Desktop\Civ 7 Tracker\civ7-tracker"
pause & exit /b 1

:repo_found
pushd "%REPO%" >nul
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "$pwd.Path"`) do set "REPOP=%%P"
popd >nul
echo [INFO] Using repo: %REPOP%

REM 1) Prepare output folder alongside the script
set "OUT=%~dp0project-file-updates"
if not exist "%OUT%" mkdir "%OUT%" >nul 2>&1
echo [INFO] Output: %OUT%
echo.

REM 2) Copy helper
:copy_file
set "SRC=%~1"
set "DST=%~2"
if not exist "%SRC%" (
  echo [WARN] Missing: %SRC%
) else (
  copy /Y "%SRC%" "%OUT%\%DST%" >nul
  echo [OK]  %DST%
)
goto :eof

REM 3) Canonical mapping (source => upload name)
call :copy_file "%REPO%\README.md"                       "ROOT-README.md"
call :copy_file "%REPO%\docs\workflow_guide.md"          "workflow_guide.md"
call :copy_file "%REPO%\chat_handoff.md"                 "chat_handoff.md"
call :copy_file "%REPO%\docs\head-snippet.txt"           "head-snippet.txt"
call :copy_file "%REPO%\docs\site.json"                  "site.json"
call :copy_file "%REPO%\docs\devlog\README.md"           "DEVLOG-README.md"
call :copy_file "%REPO%\docs\devlog\TEMPLATE.md"         "TEMPLATE.md"
call :copy_file "%REPO%\new-devlog.ps1"                  "new-devlog.ps1"
call :copy_file "%REPO%\new-devlog-today.bat"            "new-devlog-today.bat"
call :copy_file "%REPO%\new-devlog-date.bat"             "new-devlog-date.bat"
call :copy_file "%REPO%\.githooks\pre-commit.ps1"        "pre-commit.ps1"
call :copy_file "%REPO%\.gitignore"                      ".gitignore"

REM 4) Latest devlog (rename to DEVLOG-YYYY-MM-DD.md)
set "DEVLOGDIR=%REPO%\docs\devlog"
set "LATEST_DEVLOG="
if exist "%DEVLOGDIR%" (
  for /f "usebackq delims=" %%F in (`dir /b /a-d /o-n "%DEVLOGDIR%\20??-??-??.md" 2^>nul`) do (
    if not defined LATEST_DEVLOG set "LATEST_DEVLOG=%%F"
  )
  if defined LATEST_DEVLOG (
    set "SRCDEV=%DEVLOGDIR%\%LATEST_DEVLOG%"
    set "DSTDEV=DEVLOG-%LATEST_DEVLOG%"
    call :copy_file "%SRCDEV%" "%DSTDEV%"
  ) else (
    echo [WARN] No daily devlog found in %DEVLOGDIR%
  )
) else (
  echo [WARN] Missing folder: %DEVLOGDIR%
)

REM 5) Copy THIS script and add MANIFEST (for your convenience; not for upload)
copy /Y "%~f0" "%OUT%\project-file-sync.bat" >nul
set "MANI=%OUT%\MANIFEST.txt"
> "%MANI%" echo CIV7 Tracker — Project File Sync Manifest
>>"%MANI%" echo Source repo: %REPOP%
>>"%MANI%" echo Generated: %DATE% %TIME%
>>"%MANI%" echo.
>>"%MANI%" echo Included files for ChatGPT project-files:
for %%F in (
  "ROOT-README.md"
  "workflow_guide.md"
  "chat_handoff.md"
  "head-snippet.txt"
  "site.json"
  "DEVLOG-README.md"
  "TEMPLATE.md"
  "new-devlog.ps1"
  "new-devlog-today.bat"
  "new-devlog-date.bat"
  "pre-commit.ps1"
  ".gitignore"
) do if exist "%OUT%\%%~F" >>"%MANI%" echo  - %%~F
if defined LATEST_DEVLOG if exist "%OUT%\%DSTDEV%" >>"%MANI%" echo  - %DSTDEV%

echo.
echo [DONE] Files ready in: %OUT%
echo       Upload ONLY the files listed above (skip MANIFEST and this .bat).
pause
exit /b 0
