@echo off
REM Shim to run local TypeScript compiler from project root on Windows CMD
if exist "%~dp0node_modules\typescript\bin\tsc" (
  node "%~dp0node_modules\typescript\bin\tsc" %*
) else (
  echo Local TypeScript not installed. Run "npm install" to install dev dependencies.
  exit /b 1
)
