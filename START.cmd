@echo off
setlocal
cd /d "%~dp0"
if exist dist-v0.6.0a\Veyra-win32-x64\Veyra.exe (
  start "Veyra" "%~dp0dist-v0.6.0a\Veyra-win32-x64\Veyra.exe"
  exit /b 0
)
where node >nul 2>&1
if errorlevel 1 (
  echo Run a packaged Veyra.exe, or install Node.js 24 or newer for development.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24){console.error('Node.js 24 or newer is required.');process.exit(1)}"
if errorlevel 1 (
  pause
  exit /b 1
)
if not exist node_modules\electron\dist\electron.exe (
  call npm ci
  if errorlevel 1 exit /b 1
)
call npm start
if errorlevel 1 pause
