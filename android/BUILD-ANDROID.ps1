param([string]$JavaHome=$env:JAVA_HOME,[string]$SdkPath=$env:ANDROID_HOME,[string]$GradleHome=$env:GRADLE_HOME,[string]$SigningStore,[string]$BuildRoot=(Join-Path $env:LOCALAPPDATA 'VeyraAndroidBuild'))
$ErrorActionPreference='Stop'
if(!$JavaHome -or !(Test-Path -LiteralPath (Join-Path $JavaHome 'bin\java.exe'))){throw 'Set JavaHome to JDK 17 or newer.'}
if(!$SdkPath -or !(Test-Path -LiteralPath $SdkPath)){throw 'Set SdkPath to an Android SDK with platform 37.0 and build-tools 36.0.0.'}
$gradle=if($GradleHome){Join-Path $GradleHome 'bin\gradle.bat'}else{(Get-Command gradle -ErrorAction Stop).Source}
$project=Join-Path $BuildRoot 'project';New-Item -ItemType Directory -Force $project | Out-Null
foreach($name in 'settings.gradle','build.gradle','gradle.properties'){Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination $project -Force}
New-Item -ItemType Directory -Force (Join-Path $project 'app') | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'app\build.gradle') -Destination (Join-Path $project 'app') -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'app\src') -Destination (Join-Path $project 'app') -Recurse -Force
if(!$SigningStore){$SigningStore=Join-Path $BuildRoot 'signing\preview.jks'}
if(!(Test-Path -LiteralPath $SigningStore)){New-Item -ItemType Directory -Force ([IO.Path]::GetDirectoryName($SigningStore)) | Out-Null;& (Join-Path $JavaHome 'bin\keytool.exe') -genkeypair -keystore $SigningStore -storepass android -keypass android -alias androiddebugkey -dname 'CN=Veyra Preview' -keyalg RSA -keysize 2048 -validity 10000 -noprompt;if($LASTEXITCODE){throw 'Could not create preview signing key.'}}
$env:JAVA_HOME=$JavaHome;$env:ANDROID_HOME=$SdkPath
if(!$env:GRADLE_USER_HOME){$env:GRADLE_USER_HOME=Join-Path $BuildRoot 'gradle-cache'}
& $gradle -p $project --no-daemon ('-PveyraSigningStore='+$SigningStore) assembleDebug
if($LASTEXITCODE){throw 'Android build failed. See Gradle diagnostics above.'}
$release=Join-Path $PSScriptRoot 'release';New-Item -ItemType Directory -Force $release | Out-Null
Copy-Item -LiteralPath (Join-Path $project 'app\build\outputs\apk\debug\app-debug.apk') -Destination (Join-Path $release 'Veyra-Android-Preview.apk') -Force
Write-Output (Join-Path $release 'Veyra-Android-Preview.apk')
