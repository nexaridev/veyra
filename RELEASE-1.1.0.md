# Veyra 1.1.0 and Android 0.7.3

Windows 1.1.0 and Android 0.7.3 are available. Windows packages use the standard `Veyra-win32-x64/` archive directory. The website's main download button installs the Windows setup program; the ZIP is available as a secondary download.

## Windows

- Added per-extension Windows default app registration for supported local documents and images. Veyra offers these handlers without silently replacing a user's default choices. The installer removes only Veyra-owned registrations when uninstalling.
- Added settings for the file types included in the Ctrl+O open dialog. HTML, XHTML, XML, SVG, text, PDF, and image files open in their own tabs; drag-and-drop is supported.
- Polished the search provider selector and compatibility controls. The selected provider and its icon remain visible while typing.
- Refined tab focus and visibility reporting controls and tightened Android keep-awake behavior.
- Installer 1.3.5 creates the file handlers and cleans up only those entries on uninstall.

## Android

- Updated the GeckoView-based browser to 0.7.3, including touch and page visibility behavior adjustments.
- Added categories to settings and improved mobile controls.

## Downloads

- Windows setup: `VeyraSetup.exe` from installer release `installer-v1.3.5`.
- Windows browser archive: `Veyra-1.1.0-Windows.zip`.
- Android: `Veyra-Android-0.7.3.apk`.
- SHA-256 checksums are included in `SHA256SUMS.txt`.

The website's `/download/windows` route downloads the installer. The archive remains available as a secondary link and for portable/manual deployment. The browser updater manifest is signed with the project's pinned Ed25519 release key.

## Notes

This release does not claim that every website's Google sign-in flow is compatible. No broad memory-leak-free guarantee is made; report reproducible issues with the page and process memory measurements.
