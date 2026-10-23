# Veyra

A browser for Windows and Android by Nexaridev.

[Website](https://veyra.veyra-nexaridev.workers.dev) · [Downloads](https://github.com/nexaridev/veyra/releases) · [Privacy](PRIVACY.md)

## Current versions

Windows 0.6.3a and Android 0.3.2 are available as preview releases. Windows uses Electron 45. Android uses GeckoView and supports Android 8 or newer on ARM64 devices.

## Installation

Download the Windows installer from the website. Administrator rights are not required. Desktop and Start menu shortcuts are optional. Updates and uninstall preserve your browser profile.

The launcher finds browser versions in known locations, checks for updates and opens the local version when the network is unavailable. Delete Veyra removes the application while keeping your profile.

On Android, install the APK from the releases page. Updates retain the existing application identity and signing key.

## Features

Windows includes tabs with favicons, bookmarks and folders, history, sidebar panels, themes, custom wallpapers, editable shortcuts and page search. Context menus support links, text and images. Clipboard requests can use a confirmation dialog.

The password vault uses a master password, authenticated encryption and Windows protection. Filling requires the exact HTTPS origin and never submits a form automatically.

Privacy controls include tracker filtering, HTTPS upgrades, third party cookie restrictions, WebRTC settings, site permissions and temporary profiles. Memory controls can suspend eligible background tabs. Individual tabs can remain awake. Discord Rich Presence is optional.

Focus compatibility reports a visible and focused page. Virtual fullscreen acknowledges a site request without resizing the window. This mode is enabled by default and can be disabled for an individual tab. It can affect site behavior and does not guarantee compatibility with every check.

Android includes tabs, bookmarks, history, page search, desktop site mode, sharing, default browser selection, file uploads and a saved downloads list. Its interface and password features do not yet match the Windows version.

Both platforms include Veyra Pulse, an offline game with increasingly difficult waves and local records.

## Accounts and bookmarks

Veyra accounts use a separate login system with email confirmation and password recovery. The API runs on Cloudflare Workers. Supabase PostgreSQL stores account data without Supabase Auth. Brevo delivers transactional email.

Bookmark transfers are manual and encrypted on the device using a separate phrase. Use the same phrase on each device. It is never sent to the server and cannot be recovered. Passwords, history and cookies are not synchronized. Deletions are not propagated between copies.

## Development

Use Node.js 24 or newer. Run `npm ci`, then `npm start`. Run `npm run build:win` to package Windows. See [installer documentation](installer/README.md) for its build and tests.

Android requires JDK 17, Gradle 9.3.1, Android platform 37 and build tools 36.0.0. Release signing keys stay outside this repository.

See [macOS instructions](MACOS-BUILD.md) for Intel and Apple Silicon packaging. No macOS runtime testing or notarized release is available yet.

## Limitations

Veyra does not hide your IP address or replace a VPN. Google can reject login through embedded browser engines. Full fingerprint resistance and general browser extension support are not implemented.

Windows executables are not Authenticode signed. SmartScreen can warn about unfamiliar downloads. Android builds pass compilation and Lint, but acceptance testing on a physical phone is still outstanding.

## Third party software

Electron, Chromium, GeckoView, Ghostery and other dependencies retain their own licenses. Filter list terms remain in their source headers. The installer embeds Bouncy Castle and includes its license notice.
