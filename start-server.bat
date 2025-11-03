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

:: Kill any existing processes on this port
echo Checking for existing server on port %PORT%...
set "KILLED=0"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  echo Closing existing server process (PID: %%a)...
  taskkill /PID %%a /F >nul 2>&1
  set "KILLED=1"
)
if "%KILLED%"=="1" (
  echo Waiting for port to be released...
  timeout /t 2 /nobreak >nul
  echo Port should now be free.
)
echo.

:: Try to launch in browser early (non-blocking)
start "" "http://localhost:%PORT%/"

:: Prefer npx.cmd from Program Files (policy-proof)
set "NPX=%ProgramFiles%\nodejs\npx.cmd"
if exist "%NPX%" (
  echo Using Node http-server via "%NPX%"
  echo Server will start on http://localhost:%PORT%/
  echo Press Ctrl+C to stop the server.
  echo.
  pushd "%ROOT%"
  call "%NPX%" --yes http-server -p %PORT%
  popd
  goto :end
)

:: Fallback: npx on PATH
where npx >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Using Node http-server via npx on PATH
  echo Server will start on http://localhost:%PORT%/
  echo Press Ctrl+C to stop the server.
  echo.
  pushd "%ROOT%"
  call npx --yes http-server -p %PORT%
  popd
  goto :end
)

:: Final fallback: Python 3 stdlib server
where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Node+npx not found. Falling back to Python http.server
  echo Server will start on http://localhost:%PORT%/
  echo Press Ctrl+C to stop the server.
  echo.
  pushd "%ROOT%"
  python -m http.server %PORT%
  popd
  goto :end
)

:: If we get here, no server was found
echo.
echo ERROR: Neither Node+npx nor Python was found on PATH.
echo - Install Node.js LTS: https://nodejs.org/
echo   (then reopen the terminal)
echo - Or install Python 3: https://www.python.org/downloads/
echo.

:end
echo.
echo Server stopped.
pause
endlocal
:: END PACK: start-server.bat (local dev server launcher)
