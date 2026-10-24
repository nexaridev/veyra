# Veyra

> [!WARNING]
> Do not use Windows versions 0.7.0 through 0.8.3 for daily browsing. They contain a tab activation recursion bug and inefficient widget rendering that can cause high CPU use, freezes and excessive memory use. Reports reached about 8 GB of RAM. Upgrade to Windows 0.9.0 or newer. This warning concerns the Windows browser; an equivalent Android memory issue has not been confirmed.
>
> Не используйте Windows версии с 0.7.0 по 0.8.3 для повседневной работы. Рекурсивное переключение вкладок и неэффективная отрисовка виджетов могут вызывать высокую нагрузку на процессор, зависания и чрезмерный расход памяти. По сообщениям расход достигал примерно 8 ГБ ОЗУ. Обновитесь до Windows 0.9.0 или новее. Предупреждение относится к Windows; аналогичная проблема с памятью на Android не подтверждена.

A browser for Windows and Android by Nexaridev.

[Website](https://veyra.veyra-nexaridev.workers.dev) · [Downloads](https://github.com/nexaridev/veyra/releases) · [Privacy](PRIVACY-en.md)

## Current versions

Windows 0.9.1 and Android 0.6.5 are the current preview releases. Windows 0.7.0 through 0.8.3 carry a memory warning; use the current release. Windows uses Electron 45. Android uses GeckoView and supports Android 8 or newer on ARM64 devices.

## Installation

Download the Windows installer from the website. Administrator rights are not required. Desktop and Start menu shortcuts are optional. Updates and uninstall preserve your browser profile.

The launcher finds browser versions in known locations, checks for updates and opens the local version when the network is unavailable. Delete Veyra removes the application while keeping your profile.

On Android, install the APK from the releases page. Updates retain the existing application identity and signing key.

## Features

Home widgets include a clock, calendar, notes, focus timer and recent searches. Move and resize them directly on the home page. On Windows, Veyra Studio provides a visual canvas with text, shapes, images, clocks, buttons, layers and undo. Import or export `.veyrawidget` packages and publish them with a preview and explicit confirmation. Custom HTML, CSS and JavaScript run in a sandbox without network or browser data access. Builtin notes remain local; all content inside a published custom package becomes public.

The profile screen supports a custom avatar, authenticator based two factor authentication, one time recovery codes, active sessions and encrypted bookmark copies. You can name devices, revoke individual sessions and remove cloud copies. Sidebar order, visibility and width are customizable on Windows.

Windows uses the original uBlock Origin filtering and cosmetic engine through an Electron API adapter. Private Windows tabs use its network filtering without storing their browser session on disk; cosmetic filtering is unavailable there. Android can install the bundled Mozilla signed extension after displaying its permissions.

Windows speed controls limit each ordinary tab separately. Google compatibility tabs are excluded to preserve their native runtime. The value is a per tab cap, not a system wide bandwidth reservation.

Windows includes tabs with favicons, bookmarks and folders, history, sidebar panels, themes, custom wallpapers, editable shortcuts and page search. Context menus support links, text and images. Clipboard requests can use a confirmation dialog.

The password vault uses a master password, authenticated encryption and Windows protection. Filling requires the exact HTTPS origin and never submits a form automatically.

Privacy controls include tracker filtering, HTTPS upgrades, third party cookie restrictions, WebRTC settings, site permissions and temporary profiles. Memory controls can suspend eligible background tabs. Individual tabs can remain awake. Discord Rich Presence is optional.

Focus compatibility reports a visible and focused page. Virtual fullscreen acknowledges a site request without resizing the window. This mode is enabled by default and can be disabled for an individual tab. It can affect site behavior and does not guarantee compatibility with every check.

Android includes tabs, bookmarks, history, page search, desktop site mode, sharing, default browser selection, file uploads and a saved downloads list. Its interface and password features do not yet match the Windows version.

Both platforms include Veyra Pulse, an offline game with increasingly difficult waves and local records.

## Accounts and bookmarks

Veyra accounts use a separate login system with email confirmation and password recovery. The API runs on Cloudflare Workers. Supabase PostgreSQL stores account data without Supabase Auth. Brevo delivers transactional email. Registration confirmation also checks the chosen account password. An enabled second factor is required for login, password recovery and security changes.

Bookmark transfers are manual and encrypted on the device using a separate phrase. Use the same phrase on each device. It is never sent to the server and cannot be recovered. Passwords, history and cookies are not synchronized. Deletions are not propagated between copies.

## Development

Use Node.js 24 or newer. Run `npm ci`, then `npm start`. Run `npm run build:win` to package Windows. See [installer documentation](installer/README.md) for its build and tests.

Android requires JDK 17, Gradle 9.3.1, Android platform 37 and build tools 36.0.0. Release signing keys stay outside this repository.

See [macOS instructions](MACOS-BUILD.md) for Intel and Apple Silicon packaging. No macOS runtime testing or notarized release is available yet.

## Limitations

Veyra does not hide your IP address or replace a VPN. Google can reject login through embedded browser engines. Full fingerprint resistance and general browser extension support are not implemented.

Windows executables are not Authenticode signed. SmartScreen can warn about unfamiliar downloads. Android builds pass compilation and Lint, but acceptance testing on a physical phone is still outstanding.

## Third party software

Electron, Chromium, GeckoView, uBlock Origin and other dependencies retain their own licenses. Filter list terms remain in their source headers. The installer embeds Bouncy Castle and includes its license notice.

## License

Veyra is released under GPLv3. See [LICENSE](LICENSE) and [third party source details](vendor/SOURCES.md). The VPN architecture is described in [VPN design](VPN-DESIGN.md).

Russian and English are supported throughout the browser interface. The website and privacy information are available in both languages. Extension language on Windows follows the selected browser language after a restart.

Maintenance tools 1.3.0 check and update setup, launcher and uninstall together with the browser. Run the latest setup once over tools 1.1 or 1.2 to enable future maintenance updates.
