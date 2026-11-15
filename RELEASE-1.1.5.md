# Veyra 1.1.5 for Windows

Windows maintenance release. The installer installs or updates Veyra in place and preserves the browser profile.

## Changes

- Prevents page-initiated popup closure from leaving a stale sleeping tab after a sign-in flow.
- Keeps the new-tab Google and DuckDuckGo selector above the search suggestion list.
- Updates the Windows package and website download metadata to 1.1.5.
- Updates the installer to 1.3.9 with a SHA-256-pinned 1.1.5 browser archive.
- Adds an Android in-app updater that checks recent GitHub releases, verifies the release asset SHA-256, and hands installation to Android.

## Verification

- `npm test` and `npm run lint` pass.
- Android `lintRelease` and `assembleRelease` pass.
- The shipped Windows installer successfully extracts the release ZIP.
- The installer passed its 53 automated package and update checks.

## Android package status

The 0.7.6 source and release build compile, but no 0.7.6 APK is attached to this release. The only locally available Android signing keys do not match the signing certificate on the published 0.7.5 APK. Publishing a differently signed APK as an update would make Android reject it for existing users. The 0.7.5 APK remains the latest compatible public Android build until the original signing key is available.

The Windows installer is not Authenticode signed. Windows SmartScreen may show its standard warning for an unrecognized publisher.
