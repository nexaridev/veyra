# Veyra Windows 0.6.3 / Android 0.3.2 — preview

Windows: stable tab DOM prevents repeat entry animations on title/loading changes; new tabs slide in. Download icon flies to toolbar. Sync button styling fixed.
Android: saved download list, file opening and persisted read permissions.
Both: per-tab keep-awake controls. Focus/visibility compatibility is enabled by default. Virtual fullscreen starts only after a site requests it; it does not resize the window. Exit clears virtual state. This changes page API behavior and can break site assumptions; disable the per-tab mode and reload if necessary. Real fullscreen remains separate.

Windows presence, virtual fullscreen, keep-awake, navigation and clipboard checks passed. Android release build and Lint passed; physical-device verification is outstanding. macOS build script included, untested on a Mac. Windows executable is not Authenticode signed. Installer preserves the browser profile.
