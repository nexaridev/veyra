# Veyra 0.9.0 for Windows and 0.6.5 for Android

## Windows performance and reliability

Fixed recursive tab activation in the extension adapter, which could overflow the stack, queue repeated state updates and freeze browser controls. uBlock Origin now starts when a web page needs it, with profile initialization serialized instead of compiling two filtering engines before showing an empty home page.

Unmodified clock and date presets and visual widgets without custom code now render as native interface elements. Four analog clocks use zero guest web contents. Custom HTML and JavaScript still run in the isolated runtime. Preview redraws reuse the existing renderer. Leaving a page releases its widget documents, observers and guest views. Custom code widgets outside the viewport unload after 30 seconds and restart when visible; their in-memory state does not survive that unload.

In a controlled fresh profile test with four analog clocks, median total working set fell from 2286 MB to 538.5 MB and process count from 14 to 4. Peak working set across the test fell from 2368 MB to 647 MB. The empty window became available at about 0.4 seconds instead of 4.5 seconds. These are local test results, not guarantees for arbitrary sites, hardware or custom widget code. The reported 8 GB incident was not reproduced exactly. The RAM target remains a soft target.

The performance panel now distinguishes total working set, private memory and process count. Shared memory accounting can differ from Task Manager.

## Permissions and notifications

Custom site permission prompts appear for camera, microphone, notifications and other supported requests. Camera and microphone access can be remembered separately. After allowing media access, choose from available devices before the stream is returned to the site. Device labels require an initial browser managed stream, which is stopped on cancellation or replacement. Temporary grants expire on navigation. Requests are bound to the requesting document and origin.

Windows notification identity and Start menu registration are configured for native website notifications. Permission and shortcut identity were tested; delivery of a real desktop toast was not tested. Notifications require the browser to be running and do not imply background push delivery after exit.

## Android 0.6.5

Restored background tabs no longer open and load simultaneously at startup. Only the selected restored tab loads until another tab is selected. Repeated page navigation retains the existing GeckoView surface instead of detaching and attaching it each time. History, session and widget persistence is coalesced, with pending changes flushed during pause and destruction. Hidden home pages no longer keep the underlying ordinary page active unless Keep this tab awake is enabled.

The release APK compiles and passes Android Lint, retains the existing application ID and signing certificate and increments the version code. No physical Android device was available for performance measurements or acceptance testing. Page load speed still depends on the website and connection.

## Validation and known limits

Passed native widget rendering and cleanup, repeated navigation, preview renderer reuse, sandbox isolation, uBlock network and cosmetic filtering, tab selection, popup lifecycle, permission origin binding and synthetic camera and microphone selection tests. The widget sandbox still blocks network, Node access and access to browser data.

Windows versions 0.7.0 through 0.8.3 are marked with a memory warning. Upgrade instead of using those builds for daily browsing. The earlier Google unsafe browser rejection remains a separate compatibility issue and is not claimed fixed by this release.
