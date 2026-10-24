param(
 [Parameter(Mandatory=$true)][string]$ArchivePath,
 [Parameter(Mandatory=$true)][string]$InstallerPath
)
# Run with Windows PowerShell: exercise the exact shipped installer assembly.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Windows.Forms
$archive=[IO.Path]::GetFullPath($ArchivePath)
$assembly=[Reflection.Assembly]::LoadFrom([IO.Path]::GetFullPath($InstallerPath))
$type=$assembly.GetType('Veyra.Setup.Archive',$true)
$method=$type.GetMethod('Extract',[Reflection.BindingFlags]'Static,Public')
$progressType=[System.Progress``1].MakeGenericType($assembly.GetType('Veyra.Setup.ProgressInfo',$true))
$progress=[Activator]::CreateInstance($progressType)
$temporary=[IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$stage=Join-Path $temporary ('VeyraArchiveQA-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null
try {
 $parameters=New-Object object[] 4
 $parameters[0]=$archive.PSObject.BaseObject
 $parameters[1]=$stage.PSObject.BaseObject
 $parameters[2]=$progress.PSObject.BaseObject
 $parameters[3]=[Threading.CancellationToken]::None
 $method.Invoke($null,$parameters) | Out-Null
 foreach($name in @('Veyra.exe','resources/app.asar','icudtl.dat','LICENSE')) {
  if(!(Test-Path -LiteralPath (Join-Path $stage $name) -PathType Leaf)){throw ('Missing extracted file: '+$name)}
 }
 Write-Output 'PASS: release ZIP extracted by the shipped installer assembly'
} finally {
 $resolved=[IO.Path]::GetFullPath($stage)
 if(!$resolved.StartsWith($temporary.TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetFileName($resolved) -notlike 'VeyraArchiveQA-*'){throw 'Unsafe QA cleanup target'}
 Remove-Item -LiteralPath $resolved -Recurse -Force
}
