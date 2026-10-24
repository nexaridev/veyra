# Windows installer and launcher

The installer creates VeyraLauncher.exe and Delete Veyra.exe in the installation folder. Browser shortcuts point to the launcher. A separate Delete Veyra entry appears in Start.

The launcher looks in the standard installation, beside its executable and in known Veyra folders in Documents. It compares executable product versions and checks the signed release feed with an eight second timeout. Without an available update check it launches the newest local browser. An available update is offered before launch. The user can skip it. Installation requires the browser to be closed.

Delete Veyra asks for confirmation and preserves the browser profile. Windows Settings uninstall is also supported.

Build with `powershell -NoProfile -ExecutionPolicy Bypass -File installer/BUILD-INSTALLER.ps1`. Test with `powershell -NoProfile -ExecutionPolicy Bypass -File installer/TEST-INSTALLER.ps1`.

Create release ZIP files with `python scripts/archive-windows.py dist-v0.8.0/Veyra-win32-x64 outputs/Veyra-0.8.0-Windows.zip`. The archive must preserve its `Veyra-win32-x64/` directory. Before signing or publishing, run `powershell -NoProfile -ExecutionPolicy Bypass -File installer/TEST-RELEASE-ARCHIVE.ps1 -ArchivePath outputs/Veyra-0.8.0-Windows.zip -InstallerPath installer/bin/VeyraSetup.exe`. This exercises the actual installer extraction code against the complete release artifact.

Requires Windows 10 or 11, x64, and .NET Framework 4.8. No administrator rights. The manifest uses a pinned Ed25519 key. The archive is checked with SHA256 before extraction. Installation stages files and restores the previous browser on failure. Downgrades are rejected. Bouncy Castle 2.7.0 is embedded with its MIT notice. These executables are not Authenticode signed.

Installer 1.2.0 includes a Russian and English switch in setup, launcher and uninstall windows. The choice is stored locally. Existing 1.1.0 launchers are replaced when the new installer is run.

## Maintenance updates in 1.3.0

The launcher checks the signed feed for both browser and maintenance tool versions. It offers an update even when the browser is already current but setup, launcher or uninstall is older or missing. Updating requires the user's choice; offline launch and skipping remain available.

Setup downloads a newer maintenance executable into its own cache, verifies the pinned Ed25519 manifest, exact size, SHA256, product identity and file version, then passes control after the previous process exits. Setup, launcher and Delete Veyra are installed from the same verified binary. A staged local setup copy avoids replacing a running launcher. Older maintenance tools cannot overwrite newer installed setup.

When the recorded signed browser artifact and installed browser version match the current feed, an automatic maintenance update keeps the browser files and avoids downloading the archive again. An ordinary manual installation can still repair the browser. Shortcut choices and the browser profile are preserved. Installation uses the existing rollback path on failure.

Versions 1.1 and 1.2 require one manual run of setup 1.3.0 to enable this behavior. Those older executables cannot acquire a self update feature remotely. No browser or Android version change is required.
