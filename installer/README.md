# Windows online installer

Build: powershell -NoProfile -ExecutionPolicy Bypass -File installer/BUILD-INSTALLER.ps1
Tests: powershell -NoProfile -ExecutionPolicy Bypass -File installer/TEST-INSTALLER.ps1

Single x64 .NET Framework executable. Runtime requirement: Windows 10/11, .NET Framework 4.8. No administrator rights. Downloads the signed feed from the Veyra Worker, validates pinned Ed25519 signature and SHA-256, stages archive files and rolls back the previous application on installation failure. No downgrade below the installed version.

Files: LocalAppData/Programs/Veyra/app. Setup manager and ownership marker remain in the parent folder. Desktop and Start menu shortcuts are optional. Uninstall is available in Windows Settings. Browser profiles in AppData/Veyra are preserved.

BouncyCastle.Cryptography 2.7.0 is embedded, with its MIT license in the executable and installed ThirdPartyNotices.txt. Build downloads the exact NuGet package only after checking its pinned hash. The installer itself is not Authenticode signed.
