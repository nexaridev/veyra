# macOS preview build

On a Mac with Node.js 24+, clone this repository, run `npm ci`, then `node scripts/package-mac.cjs`. Outputs: dist-mac/Veyra-darwin-arm64/Veyra.app and dist-mac/Veyra-darwin-x64/Veyra.app. Test each architecture on its matching Mac.

This produces unsigned app bundles, not a notarized installer. Public distribution needs an Apple Developer Developer ID Application certificate, hardened runtime, Electron entitlements, signing nested frameworks, notarization with notarytool, stapling and a signed DMG. Never disable Gatekeeper globally. Windows-specific default browser registration and secure storage require macOS acceptance testing. No Mac runtime test has been performed here.
