param([string]$OutputPath=(Join-Path $PSScriptRoot 'bin\VeyraSetup.exe'))
$ErrorActionPreference='Stop'
[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.IO.Compression.FileSystem
$deps=Join-Path $PSScriptRoot '.deps'
New-Item -ItemType Directory -Path $deps -Force | Out-Null
$package=Join-Path $deps 'bouncycastle.cryptography.2.7.0.nupkg'
$expected='f091ffccab4d03993e660bace277659a79dee0972f54d7f1f4bd46d680966241'
if(!(Test-Path -LiteralPath $package)){Invoke-WebRequest -Uri 'https://api.nuget.org/v3-flatcontainer/bouncycastle.cryptography/2.7.0/bouncycastle.cryptography.2.7.0.nupkg' -OutFile $package -UseBasicParsing}
if((Get-FileHash -LiteralPath $package -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected){throw 'BouncyCastle package hash does not match the pinned dependency.'}
$dll=Join-Path $deps 'BouncyCastle.Cryptography.dll'
$license=Join-Path $deps 'BouncyCastle-LICENSE.md'
$archive=[IO.Compression.ZipFile]::OpenRead($package)
try{foreach($entryName in @('lib/net461/BouncyCastle.Cryptography.dll','LICENSE.md')){
 $entry=$archive.GetEntry($entryName);if(!$entry){throw ('Missing dependency entry: '+$entryName)}
 $target=if($entryName.EndsWith('.dll')){$dll}else{$license}
 $inputStream=$entry.Open();$outputStream=[IO.File]::Create($target)
 try{$inputStream.CopyTo($outputStream)}finally{$inputStream.Dispose();$outputStream.Dispose()}
}}finally{$archive.Dispose()}
$compressed=Join-Path $deps 'bc.gz';$inputStream=[IO.File]::OpenRead($dll);$outputStream=[IO.File]::Create($compressed);$gzip=New-Object IO.Compression.GZipStream($outputStream,[IO.Compression.CompressionMode]::Compress)
try{$inputStream.CopyTo($gzip)}finally{$inputStream.Dispose();$gzip.Dispose();$outputStream.Dispose()}
$compiler=Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if(!(Test-Path -LiteralPath $compiler)){throw '.NET Framework 4.8 / 64-bit Windows is required to build the installer.'}
$OutputPath=[IO.Path]::GetFullPath($OutputPath);New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($OutputPath)) -Force | Out-Null
$arguments=@('/nologo','/target:winexe','/platform:x64','/optimize+',('/out:'+$OutputPath),('/win32manifest:'+(Join-Path $PSScriptRoot 'app.manifest')),('/win32icon:'+(Join-Path $PSScriptRoot '..\src\assets\app.ico')),('/resource:'+$compressed+',bc.gz'),('/resource:'+$license+',bc-license.txt'),('/reference:'+$dll),'/reference:System.Net.Http.dll','/reference:System.IO.Compression.dll','/reference:System.IO.Compression.FileSystem.dll','/reference:System.Web.Extensions.dll','/reference:Microsoft.CSharp.dll',(Join-Path $PSScriptRoot 'Core.cs'),(Join-Path $PSScriptRoot 'Program.cs'),(Join-Path $PSScriptRoot 'Launcher.cs'))
& $compiler @arguments
if($LASTEXITCODE){throw 'Installer compilation failed.'}
Copy-Item -LiteralPath $license -Destination (Join-Path ([IO.Path]::GetDirectoryName($OutputPath)) 'VeyraSetup-LICENSE.txt') -Force
Write-Output $OutputPath

foreach($name in @('VeyraLauncher.exe','Delete Veyra.exe')) { $target=Join-Path ([IO.Path]::GetDirectoryName($OutputPath)) $name; if($target -ne $OutputPath){Copy-Item -LiteralPath $OutputPath -Destination $target -Force} }
