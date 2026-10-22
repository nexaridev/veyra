@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 24 or newer is required to build from source.
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24){console.error('Node.js 24 or newer is required.');process.exit(1)}"
if errorlevel 1 exit /b 1
if not exist node_modules\@ghostery\adblocker (
  call npm ci
  if errorlevel 1 exit /b 1
)
call npm run build:win
if errorlevel 1 exit /b 1
powershell -NoProfile -Command "$ErrorActionPreference='Stop'; Compress-Archive -LiteralPath '.\dist-v0.6.1\Veyra-win32-x64' -DestinationPath '.\dist-v0.6.1\Veyra-Windows.zip' -Force"
if errorlevel 1 exit /b 1
echo Build: dist-v0.6.1\Veyra-win32-x64\Veyra.exe
echo Archive: dist-v0.6.1\Veyra-Windows.zip
exit /b 0
