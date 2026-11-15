# Veyra 1.1.3

Windows browser release with Android 0.7.5.

## Changes

- Added a dedicated Privacy section in Settings for tracking protection, WebRTC policy, clipboard handling, and focus/fullscreen compatibility controls.
- New profiles start with Sandbox Clipboard Mode enabled. A previously saved clipboard choice is preserved across upgrades. The setting applies to open tabs without reloading them.
- Shift + right-click opens the Veyra context menu even when a page blocks its own context menu. Only that explicit gesture is intercepted; ordinary right-click behavior is unchanged.
- Raised the address suggestion layer so the dropdown stays above neighboring toolbar controls.
- Kept internal sync and update requests on Electron's Chromium network stack; local HTML sessions use the shared filtered session factory.
- Updated the website release metadata and installer fallback for the new browser build.
- Added a Veyra website account center for email sign-in and verification, profile pictures, device sessions, password and authenticator management, and encrypted bookmark backup import/export. Web sessions use an HttpOnly, Secure, SameSite cookie.

## Notes

Sandbox clipboard mode routes browser shortcuts and Veyra context-menu clipboard actions through the browser. Websites do not receive those copy, cut, and paste events. Rich-text editors may lose formatting; switch clipboard mode in Settings when needed.

Windows automatic updates still require a valid signed update manifest. The legacy signed feed was not replaced in this source update because its signing key was unavailable; use the release installer or download the verified Windows archive directly.

The application is MIT licensed. Copyright (c) 2026 Nexaridev.
