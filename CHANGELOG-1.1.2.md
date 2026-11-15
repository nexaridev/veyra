# Veyra Windows 1.1.2 and Android 0.7.4 release candidate

## Included

- Compatibility visibility and fullscreen switches now update live tabs without reloading them. Turning a switch off restores the original own-property descriptors and removes the registered event handlers.
- Android compatibility settings use a persistent native-messaging port so settings changes reach already open GeckoView pages.
- Search suggestions now attach below their search field and stack above adjacent controls.
- Sync and update HTTP requests use Electron's Chromium network API.
- Local HTML tabs use named Veyra sessions with browser request hooks, the page preload, and the content blocker.
- Added a repeatable live-toggle integration check and JavaScript syntax lint command.

## Not included

- Hidden text selection, suppressed clipboard events, undetectable context-menu bypasses, and native-looking function masking are not implemented. Text selection and page clipboard events keep their normal browser behavior; clipboard access stays behind the existing user-facing permission flow.
- Android `assembleRelease` and `lintRelease` completed, but the generated APK is unsigned because the original release signing key is not present in this environment. It cannot update an existing signed installation in place.
