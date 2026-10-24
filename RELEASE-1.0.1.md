# Veyra 1.0.1 for Windows

A Discord icon beside the browser version now opens the [Veyra support server](https://discord.gg/29m8etyA9R) in a new tab. It is available in the main menu and Settings > About. The button has Russian and English hover text and an accessible label. A support link is also available in the repository README.

This release retains the external application confirmation and Copy clean link features from 1.0.0. Android 0.6.6 adds the same Discord support icon beside its version in Settings, with Russian, English and Ukrainian accessibility labels. The APK retains its application ID and signing certificate for upgrades. Setup, Launcher and Delete Veyra remain 1.3.1 and install this browser version through the signed update feed. Local browser profiles are preserved.

Verification: the Chromium UI check passed both version locations, RU/EN labels and existing account, popup and close regressions. The packaged source and version metadata were checked. Release file hashes, the signed update feed, RU/EN website and download routes were verified after publication.

Google compatibility remains experimental; acceptance by Google is not guaranteed. See [1.0.0 features and limitations](https://github.com/nexaridev/veyra/blob/main/RELEASE-1.0.0.md). No backend account or database changes are included.

Android 0.6.6 compiled and passed release Lint. APK signature verification confirms the same signing certificate as 0.6.5, version code 10 and debuggable=false. Physical device UI testing was not performed.
