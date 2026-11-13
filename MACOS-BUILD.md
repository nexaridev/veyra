# macOS build

On a Mac with Node.js 24 or newer, clone the Veyra repository and run:

```sh
npm ci
npm run build:mac
npm run build:mac:dmg
```

The universal app is created in `dist-v1.1.0-mac/Veyra-darwin-universal/Veyra.app`. The drag-to-Applications disk image is `outputs/Veyra-1.1.0-macOS-universal.dmg`.

The current bundle is unsigned and not notarized. A public macOS release needs an Apple Developer ID Application certificate, hardened runtime, Electron entitlements, signing of nested frameworks, notarization with `notarytool`, stapling and a signed DMG. Do not disable Gatekeeper. Windows-specific default browser registration and secure storage require macOS acceptance testing.
