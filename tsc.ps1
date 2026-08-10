# PowerShell shim to run local TypeScript compiler from project root
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$local = Join-Path $root "node_modules\typescript\bin\tsc"
if (Test-Path $local) {
  node $local @args
} else {
  Write-Error "Local TypeScript not installed. Run 'npm install' to install dev dependencies."
  exit 1
}
