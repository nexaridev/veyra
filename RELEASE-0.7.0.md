# Veyra Windows 0.7.0 and Android 0.5.0

Home widgets can be moved and resized directly. Clock, calendar, notes, focus timer and recent searches are available in the free collection. Signed in users can publish widget designs and remove their own publications. Publications contain a fixed widget type and presentation options; they cannot contain scripts or local note text.

Windows keyboard shortcuts use physical letter keys, so common combinations also work with a Cyrillic keyboard layout. New tabs focus search immediately. Recent searches are stored locally, with a clear control and no recording in private tabs.

Windows sidebar buttons can be reordered or hidden and its width can be changed. Settings rows and selects have consistent styling. Additional translations cover settings, accounts, widgets and update controls.

The profile screen on both platforms lists devices and cloud bookmark copies. Device names, individual session revocation and copy deletion are supported. Bookmark transfers still use a separate encryption phrase and are initiated by the user. Passwords, cookies and browsing history are excluded.

Windows uses uBlock Origin 1.75.0 with an Electron transport adapter and its original filter engine. Ordinary profiles also support cosmetic filtering. Private Windows tabs retain memory only browser storage and use network filtering, without cosmetic extension injection. Android offers the bundled Mozilla signed uBlock Origin XPI after displaying permissions, including an explicit private tab access choice.

Windows performance controls include download and upload limits per ordinary tab. Google compatibility tabs are excluded to keep their native runtime. The limits are not a whole device network quota. RAM remains a soft target.

Android adds editable home search, recent queries, movable and resizable widgets, a free widget collection, community design publication, device profile controls and hardware keyboard shortcuts. Existing file selection, downloads and offline game support are retained. The APK uses the existing application identity and signing key.

Veyra now uses GPLv3 with the user's approval. Third party sources and notices are documented in vendor/SOURCES.md. A VPN implementation plan is included in VPN-DESIGN.md; this release does not operate a VPN service.

## Verification and limits

Desktop checks exercise free widget movement and resizing, saved layouts, physical keyboard shortcuts, focus, sidebar order, actual advertising request filtering, private profile network filtering and measured per tab bandwidth throttling. The Android release compiles and passes Lint; physical device acceptance testing remains outstanding.

The backend received a fresh static security scan. No new confirmed findings were reported in the final reviewed infrastructure snapshot. The earlier account timing issue was addressed with an encrypted durable mail outbox, provider independent public responses and matching signup password hashing work. Delivery retries are leased and scheduled every minute. A source scan is not a guarantee against every vulnerability.

Google can still reject sign in through embedded browser engines. This release does not claim a verified successful Google login after email entry. Windows binaries are not Authenticode signed and SmartScreen can still warn about unfamiliar downloads.

Russian and English interface coverage includes profile controls, widget customization, context menus, update messages, network limit indicators and account errors. The bilingual website includes privacy information. Installer 1.2.0 adds a persistent Russian and English switch to setup, launcher and uninstall windows. Existing launchers are updated by running the new installer.
