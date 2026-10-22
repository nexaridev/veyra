# Veyra

Windows **0.6.0** · Android **0.2.0**

Desktop browser built with Electron, Android browser built with GeckoView. Custom interface, bookmarks, privacy controls and optional encrypted bookmark transfers.

Read [release notes and known limitations](RELEASE-0.6.0.md) and [privacy details](PRIVACY.md) before testing. This is a release candidate; mobile device and real account cross-device tests are still outstanding. Public downloads are provided only through GitHub Releases when available.

## Windows build

Node.js 24+, Windows x64: `npm ci`, then `npm run build:win`. Output: `dist-v0.6.0/Veyra-win32-x64/Veyra.exe`. `BUILD-WINDOWS.cmd` also creates a ZIP.

## Android build

See [Android release build](android/RELEASE.md). Java 17, Gradle 9.3.1, Android SDK platform 37.0 and build tools 36.0.0. CI builds use a separate debug key.

## Services

Supabase stores user accounts and client-encrypted bookmark payloads. The public configuration contains a publishable key, never a service role key. Each user may access only their own rows through RLS. Production signup requires configured SMTP. Cloudflare R2 is optional and is not yet active.

## Updates

Windows can check a pinned Ed25519-signed manifest, download a ZIP, and verify SHA256 before saving. Installation is manual. The signing private key is intentionally absent. `scripts/sign-update.cjs` accepts an external private-key path. Never commit keystores, private keys, browser profiles or credentials.

## Tests

`node tests/crypto-060.cjs`. Electron integration tests require isolated `VEYRA_QA_PROFILE` and `VEYRA_QA_OUTPUT` paths; see test sources. Android: `gradle -p android lintRelease`.
