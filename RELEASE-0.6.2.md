# Veyra Windows 0.6.2 / Android 0.3.1 preview

Veyra Pulse is an offline bullet-dodging game. Waves continue indefinitely and grow harder; six patterns alternate. Arrows/WASD move, Shift slows movement, Space dashes, P/Escape pauses. Android has drag and touch controls. Open veyra://offline or Play offline on the failed-load page. Best wave is saved locally, except in private sessions. No game network requests.

Windows online installer downloads a signed manifest and checks Ed25519 and archive SHA-256 before extraction. Installation is per user under LocalAppData/Programs/Veyra. Desktop and Start menu shortcuts are optional. Updates and uninstall preserve the browser profile in AppData/Veyra. Windows 10/11 x64 and .NET Framework 4.8 required. Executables are not Authenticode signed.

Android build and Lint passed; physical device testing is outstanding. The game uses a bundled, network-disabled WebView; websites still use GeckoView. Existing account and privacy limitations are described in RELEASE-0.6.1.md.
