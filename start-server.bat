:: START PACK: start-server.bat (local dev server launcher)
@echo off
setlocal

:: Optional first arg = port (default 8080)
set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

:: Repo root = folder where this script lives
set "ROOT=%~dp0"

echo.
echo ==========================================
echo  CIV7 Tracker - Local Dev Server
echo  Root: %ROOT%
echo  Port: %PORT%
echo ==========================================
echo.

:: Try to launch in browser early (non-blocking)
start "" "http://localhost:%PORT%/"

:: Prefer npx.cmd from Program Files (policy-proof)
set "NPX=%ProgramFiles%\nodejs\npx.cmd"
if exist "%NPX%" (
  echo Using Node http-server via "%NPX%"
  pushd "%ROOT%"
  "%NPX%" --yes http-server -p %PORT%
  popd
  goto :eof
)

:: Fallback: npx on PATH
where npx >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Using Node http-server via npx on PATH
  pushd "%ROOT%"
  npx --yes http-server -p %PORT%
  popd
  goto :eof
)

:: Final fallback: Python 3 stdlib server
where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Node+npx not found. Falling back to Python http.server
  pushd "%ROOT%"
  python -m http.server %PORT%
  popd
  goto :eof
)

echo.
echo ERROR: Neither Node+npx nor Python was found on PATH.
echo - Install Node.js LTS: https://nodejs.org/
echo   (then reopen the terminal)
echo - Or install Python 3: https://www.python.org/downloads/
echo.
pause
endlocal
:: END PACK: start-server.bat (local dev server launcher)
