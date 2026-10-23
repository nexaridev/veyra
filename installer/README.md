# Windows installer and launcher

The installer creates VeyraLauncher.exe and Delete Veyra.exe in the installation folder. Browser shortcuts point to the launcher. A separate Delete Veyra entry appears in Start.

The launcher looks in the standard installation, beside its executable and in known Veyra folders in Documents. It compares executable product versions and checks the signed release feed with an eight second timeout. Without an available update check it launches the newest local browser. An available update is offered before launch. The user can skip it. Installation requires the browser to be closed.

Delete Veyra asks for confirmation and preserves the browser profile. Windows Settings uninstall is also supported.

Build with `powershell -NoProfile -ExecutionPolicy Bypass -File installer/BUILD-INSTALLER.ps1`. Test with `powershell -NoProfile -ExecutionPolicy Bypass -File installer/TEST-INSTALLER.ps1`.

Requires Windows 10 or 11, x64, and .NET Framework 4.8. No administrator rights. The manifest uses a pinned Ed25519 key. The archive is checked with SHA256 before extraction. Installation stages files and restores the previous browser on failure. Downgrades are rejected. Bouncy Castle 2.7.0 is embedded with its MIT notice. These executables are not Authenticode signed.
