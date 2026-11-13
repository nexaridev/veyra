# Windows 0.8.0 and Android 0.6.0

Windows adds Veyra Studio at `veyra://widget-studio`. Build widgets on a visual canvas with text, shapes, images, clocks and buttons. Move and resize elements, change layers and colors, undo changes, and start from clock, calendar or checklist templates. The editor saves a local draft.

Import and export `.veyrawidget` files. Custom packages may contain HTML, CSS and JavaScript. Preview and installation use an opaque sandbox with scripts enabled, no browser bridge and no network, cookie, file or account access. Publishing requires an account and a separate confirmation that the complete package, including its text and images, becomes public. Builtin notes and recent searches remain local.

Home widgets can move freely across the new tab desktop. Use Edit to reveal drag and resize controls, then Done to return to browsing. Layout changes preserve running widget frames.

Both platforms add profile avatars and authenticator based two factor authentication. Enrollment requires a valid app code before activation. Ten recovery codes are shown once and work once each. Enabling protection or changing recovery codes signs out other devices. Login, password recovery and sensitive account changes enforce the factor on the server. Windows generates setup QR images locally. Android can open an installed authenticator or use the manual setup key.

Registration confirmation now checks the password chosen during registration. Legacy synchronization storage also enforces the device quota. Existing account data and browser sessions remain in their existing locations.

## Verification

Electron checks cover the visual editor, literal user text, undo, replay of saved layouts, free dragging, isolated custom code and blocked host, storage and network access, including direct WebRTC UDP and TCP attempts. A live synthetic account exercised profile saving, enrollment, recovery codes and the login challenge through the actual Windows UI and API. The fixture account was removed afterwards.

Transaction based database tests cover RFC 6238 vectors, enrollment proof, TOTP replay rejection, single use recovery codes, recovery rotation, password recovery with MFA, session revocation, profile validation, widget ownership, registration binding and legacy quotas. Fixtures roll back. Android compilation and release Lint pass with the existing signing identity.

The backend received an independent source audit. Two issues in existing registration and legacy storage paths were addressed before deployment. An audit does not guarantee the absence of every vulnerability.

## Limits

The visual constructor and executable widget packages are Windows features in this release. Android retains its native builtin widgets and receives the avatar and account security changes. Custom packages have no network permission in this version. Public widget publication exposes all content inside the package. Persistent notes should use the builtin Notes widget.

Android still needs acceptance testing on physical devices. No macOS runtime testing or notarized build is supplied. Windows binaries are not Authenticode signed. Google may reject embedded browser sign in. This release does not provide a VPN.

[Русский](RELEASE-0.8.0-ru.md)
