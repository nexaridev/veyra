# Veyra Android 0.7.3

The Android application uses GeckoView 158 with a native interface. It requires Android 8 or newer and an ARM64 device.

The release includes normal and private tabs, bookmarks, history, downloads, file uploads, desktop site mode, sharing, default browser selection and an offline game. The home page supports recent searches, movable and resizable widgets and a free collection. Signed in users can publish widget designs without sharing local notes. Profiles include devices, session revocation and manual encrypted bookmark transfer.

Russian, English and Ukrainian interfaces are included. The bundled Mozilla signed uBlock Origin extension displays permissions before installation. Android does not yet include the desktop password vault or every desktop privacy control.

## Build

Use JDK 17, Gradle 9.3.1, Android platform 37 and build tools 36.0.0. Run `gradle -p android assembleDebug lintDebug` for a development APK. Release signing keys and passwords must remain outside the repository. Existing installations require the original application identity and signing key for data preserving upgrades.

## Verification

Android 0.7.3 is available in the [Veyra 1.1.0 release](https://github.com/nexaridev/veyra/releases/tag/v1.1.0). Release builds require the original application signing key, which must remain outside the repository. Website-specific fullscreen and Google sign-in acceptance tests are not claimed by this release. This application does not provide a VPN or hide your IP address.
