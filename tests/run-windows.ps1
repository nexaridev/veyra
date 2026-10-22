$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$env:VEYRA_QA_PROFILE = Join-Path $projectRoot ('work\qa-profile-' + [Guid]::NewGuid().ToString('N'))
$env:VEYRA_QA_OUTPUT = Join-Path $projectRoot 'outputs\qa'
$electronPath = Join-Path $projectRoot 'node_modules\electron\dist\electron.exe'
if (-not (Test-Path -LiteralPath $electronPath)) { throw 'Run npm ci with Node.js 24+ first.' }
if (-not (Test-Path -LiteralPath 'work\qa-tls\cert.pem')) { throw 'Generate the local QA fixture first: python tests/generate-qa-cert.py' }
New-Item -ItemType Directory -Path $env:VEYRA_QA_OUTPUT -Force | Out-Null
$qaProcess = Start-Process -FilePath $electronPath -ArgumentList ('"' + (Join-Path $PSScriptRoot 'integration.cjs') + '"') -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput (Join-Path $env:VEYRA_QA_OUTPUT 'stdout.log') -RedirectStandardError (Join-Path $env:VEYRA_QA_OUTPUT 'stderr.log')
Get-Content -LiteralPath (Join-Path $env:VEYRA_QA_OUTPUT 'stdout.log')
Get-Content -LiteralPath (Join-Path $env:VEYRA_QA_OUTPUT 'stderr.log')
exit $qaProcess.ExitCode
