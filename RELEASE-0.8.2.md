# Veyra 0.8.2 for Windows and Android 0.6.1

Website popups displayed as tabs now retain their native opener connection, message delivery and cookie session through sign-in redirects. Script-requested closing removes the popup tab and returns to its opener. Blank popups can navigate normally. Popup tabs are kept awake while their flow is open. Separate website windows remain optional.

Android now handles script-requested popup closing and returns to the originating tab. Popup blank-page navigation is allowed without allowing arbitrary internal URLs.

Validation: Windows local popup fixture covers opener, cross-origin result delivery, compatibility-domain navigation, script close, browser close, blank popups, custom dialogs and optional separate windows. Android release compilation and lint are checked. A real Google account sign-in has not been verified, and compatibility with Google's embedded-browser restrictions is not guaranteed.

Website security headers from the previous patch are retained. Maintenance tools remain 1.3.1. Profiles are preserved. Windows executables are not Authenticode signed.
