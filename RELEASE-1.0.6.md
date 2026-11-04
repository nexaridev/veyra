# Veyra 1.0.6

## Windows

- Added DevTools shortcuts: F12, Ctrl+Shift+I, and Ctrl+Shift+J. The page context menu also includes Inspect element.
- Added per-site compatibility controls for page focus and fullscreen APIs. Simulated fullscreen does not resize the browser window; real window fullscreen is an independent user setting.
- Compatibility settings can be changed without restarting the browser.
- Fixed persistence of external application permissions when Windows cannot identify a protocol handler.
- Fixed widget package CSP generation so approved HTTPS widget domains can be used.

## Android 0.6.7

- Added document-start compatibility injection and user-configurable focus/fullscreen behavior.
- Real window fullscreen remains a separate user setting.
- Recover the current page if GeckoView kills its content process while the app is in the background.
