# Veyra 1.0.0 for Windows

Sites can now open installed applications such as Roblox through a Veyra confirmation dialog. It shows the requesting site, the application registered in Windows and the link type. Cancel is focused by default. Missing applications are explained without opening a blank tab. Application links from normal navigation, new windows and frames use the same handler.

You can remember permission for an HTTPS site and application type. Private sessions do not store these permissions. Cross origin frame requests cannot borrow the top site's permission. Navigation, closing the tab or a timeout cancels pending requests. Settings includes individual and complete permission reset. Launch URLs stay in the main process; the dialog does not receive authentication parameters.

The new Copy clean link command is available in the browser menu and link context menu. It removes known advertising parameters such as utm_source and fbclid. Other parameter encoding, OAuth code/state values and fragments are preserved. Recognized signed URLs are left unchanged.

Both features include Russian and English interfaces. The existing Google site compatibility experiment is retained. Actual Google account acceptance is not guaranteed: Google can reject embedded browsers. No real credentials were used in verification.

## Verification

Chromium integration tests passed actual anchor, location, window.open and iframe interception, consent, saved grants, reset, missing handlers, default Cancel and RU/EN dialogs. OS application launches were mocked; launching a real Roblox game was not performed. Unit tests covered blocked schemes, source binding, stale prompts, temporary sessions and clean link preservation. Account UI, popup/opener, Google compatibility and the standard test suite passed.

Android remains 0.6.5. Setup, launcher and Delete Veyra remain 1.3.1 and use the signed feed to install Windows 1.0.0. Windows 0.9.1 and 0.9.2 remain available for rollback. The profile format is unchanged apart from the new application permission setting. Website accounts and database are unchanged in this release.
