# Veyra 0.9.1 for Windows

Ordinary external HTTP and HTTPS links from any application open as tabs in the running Veyra instance. Links received while startup is still in progress are queued instead of being discarded.

Explicit site popups, including requests with popup or window sizing features and Chromium new-window requests, now keep a real browser window even when ordinary links are set to open in tabs. Ordinary new-tab links remain tabs. The opener connection, session, postMessage return path and script-driven close are preserved. The setting for opening all new site links as windows remains available, with updated Russian and English help text.

Verified ordinary tab links, a native authentication-style popup, same-session opener messaging and close, generic external application URL dispatch, about:blank navigation, custom dialogs and browser shutdown. The test uses local fixtures and does not sign in to Google. This change does not claim to fix Google's unsafe-browser rejection. Windows 0.9.0 memory improvements remain included.

Android remains 0.6.5. Maintenance tools remain 1.3.1 and use the updated signed feed.
