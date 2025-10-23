@echo on
setlocal
git config core.hooksPath .githooks
if exist ".githooks\pre-commit.ps1" powershell -NoProfile -ExecutionPolicy Bypass -Command "Unblock-File '.githooks\pre-commit.ps1'" 2>$nul
git config --get core.hooksPath
where node
where npx
echo [DONE] Try run-hook-log.bat next.
pause