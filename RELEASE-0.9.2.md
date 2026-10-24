# Veyra 0.9.2 for Windows, experimental site compatibility

Compatibility settings now follow the current site independently of the cookie/session partition. A protected Claude page can open a Google sign-in popup in the same session, retaining its opener and OAuth return path, while Google receives Electron's original User-Agent and Chromium Client Hints. No Firefox identity or fabricated device values are used. The Claude opener retains its protected identity and settings.

Google compatibility pages skip Veyra's page API wrappers, including media selection, focus/fullscreen emulation, passkey suppression and custom clipboard/dialog wrappers. Native permission prompts still pass through Veyra's permission manager. Custom media device selection remains available on protected pages. Filtering and the configured WebRTC privacy setting remain active.

DNT/GPC insertion, Veyra's third-party cookie blocking, automatic recoloring and network throttling follow the current site rather than the storage profile. Returning to a protected callback restores those rules without replacing the window or moving cookies. Chromium can retain the original UA throughout a single HTTP redirect chain, including the callback document; its page, worker and request identity stay consistent. The original Claude tab is unchanged. Browser-native cookie restrictions still apply.

Tab tooltips, the address icon and popup captions show Site compatibility or Site protection instead of inferring behavior from the storage profile. Diagnostics report effective cookie/DNT settings. No profile format migration or automatic cookie transfer is performed. Existing Google sessions in the separate compatibility partition are not copied into a protected opener's partition, so sign-in may be required again.

## Verification

Loopback HTTPS fixtures verified the protected opener, Google UA in the initial request, page, iframe, dedicated worker and service worker, native Google APIs, cookie policy changes, a real HTTP redirect back, opener messaging and script close. Also passed about:blank popups, popups hosted as tabs, UI labels, dark/network settings, account UI regression and synthetic camera/microphone permissions. No real Google credentials were entered. Actual Google account acceptance remains unverified and can still be rejected by Google's embedded-browser policy.

Research: [Google secure browser policy](https://developers.google.com/identity/protocols/oauth2/policies#use_secure_browsers), [a related Electron application's UA investigation](https://github.com/stablyai/orca/issues/11518). These sources motivate the experiment and do not guarantee Google sign-in for Veyra.

Android remains 0.6.5. Maintenance tools remain 1.3.1. The Windows 0.9.1 release, binaries and signed feed are retained for rollback. Close Veyra before switching binaries; the profile schema is unchanged.
