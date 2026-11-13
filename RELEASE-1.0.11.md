# Veyra 1.0.11

Windows quick fix: site icons now appear in tabs and home shortcuts, home search includes Firefox-style history/search suggestions and a search-engine picker, Customize categories fit the panel, Performance labels are translated in English, and Alt+` switches reliably between the two most recent tabs. Removed the blocked-request count and Site protection badge from the new tab page, and fixed its lower layout strip.

macOS packaging is now available as a universal app and drag-to-Applications DMG. Build on macOS with `npm ci`, `npm run build:mac`, and `npm run build:mac:dmg`. The macOS app is not signed or notarized.

Verification: `npm test`, Windows package build, ZIP extraction with the shipped installer, SHA-256 check. Android remains at 0.7.2.
