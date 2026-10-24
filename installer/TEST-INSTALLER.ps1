param([string]$OutputDirectory=(Join-Path $PSScriptRoot ('bin\tests-'+[Guid]::NewGuid().ToString('N'))))
$ErrorActionPreference='Stop'
$OutputDirectory=[IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
& (Join-Path $PSScriptRoot 'BUILD-INSTALLER.ps1') -OutputPath (Join-Path $OutputDirectory 'VeyraSetup.exe')
$deps=Join-Path $PSScriptRoot '.deps';$compiler=Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe';$test=Join-Path $OutputDirectory 'InstallerTests.exe'
$arguments=@('/nologo','/target:exe','/platform:x64','/main:Veyra.Setup.Tests',('/out:'+$test),('/resource:'+(Join-Path $deps 'bc.gz')+',bc.gz'),('/resource:'+(Join-Path $deps 'BouncyCastle-LICENSE.md')+',bc-license.txt'),('/reference:'+(Join-Path $deps 'BouncyCastle.Cryptography.dll')),'/reference:System.Net.Http.dll','/reference:System.IO.Compression.dll','/reference:System.IO.Compression.FileSystem.dll','/reference:System.Web.Extensions.dll','/reference:Microsoft.CSharp.dll',(Join-Path $PSScriptRoot 'Core.cs'),(Join-Path $PSScriptRoot 'Program.cs'),(Join-Path $PSScriptRoot 'Launcher.cs'),(Join-Path $PSScriptRoot 'ManagerUpdates.cs'),(Join-Path $PSScriptRoot 'Tests.cs'),(Join-Path $PSScriptRoot 'ManagerTests.cs'))
& $compiler @arguments
if($LASTEXITCODE){throw 'Installer test compilation failed.'}
& $test (Join-Path $OutputDirectory 'fixtures')
if($LASTEXITCODE){throw 'Installer tests failed.'}

