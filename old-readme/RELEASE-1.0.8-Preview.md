# Veyra 1.0.8 Preview

This is a testing build. It is published as a GitHub prerelease and is not offered through the stable in-app updater.

## Windows

- Restores the exact selected tab, including when tabs share the same URL.
- Restores sleeping tabs without loading their pages until selected.
- Adds optional, locally encrypted restoration of ordinary HTTPS form drafts. Passwords, one-time codes and payment fields are excluded.
- Keeps Chromium background throttling enabled while the browser applies its own sleeping policy.
- Includes the current compatibility, privacy and interface fixes.

## Android

- Updates to 0.7.1 and includes website notification permission handling.
- Signed with the existing Veyra Android signing key.

The Windows build is not Authenticode signed. The Android build was compiled and passed Gradle lint; physical-device acceptance testing remains outstanding. The reported Windows memory issue needs real-world testing with this preview.
