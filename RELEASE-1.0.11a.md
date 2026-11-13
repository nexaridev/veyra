# Veyra 1.0.11a

Windows quick fix. The home search now follows the Firefox-style layout from the reference: a compact custom search provider picker, full-width visited-site rows with locally stored favicons, and a separate recent searches group. No external favicon service is used. The Veyra download website now has an English-first motion design with five language choices (English, Russian, Ukrainian, German and Polish), responsive feature cards, scroll reveals and reduced-motion support.

Android remains at 0.7.2. macOS builds are not included in this Windows release; a friend can create a universal DMG on a Mac with `npm ci`, `npm run build:mac`, and `npm run build:mac:dmg`. The app bundle is not signed or notarized.

Verification: `npm test`, isolated Electron UI/refinement checks, Windows packaging, archive extraction using the shipped installer, site localization/motion rendering checks, Wrangler dry-run and SHA-256.
