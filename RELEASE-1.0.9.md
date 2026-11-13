# Veyra 1.0.9 for Windows and 0.7.2 for Android

Windows 1.0.9 and Android 0.7.2 are the current release builds. The Android APK is signed with the existing application key and was installed and launched on a physical phone.

This release includes the current Windows interface, session handling and local file support, plus the Android GeckoView build. Google sign-in and site-specific fullscreen behavior still depend on the embedded browser engine and site policy. Windows browser executables are not Authenticode signed and may receive a SmartScreen warning.

Verification: `npm test`, Windows packaging, Android `lintRelease` and `assembleRelease`, APK signature verification, and launch from the Android home screen. This check does not claim that every website or memory workload was exhaustively tested.
