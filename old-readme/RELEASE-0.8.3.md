# Veyra 0.8.3 for Windows

The browser toolbar renderer now disables background throttling so its timers and animation frames remain responsive when website views cover its content area. This addresses a possible cause of queued-looking UI actions that become visible after switching tabs.

The popup regression fixture now checks the production toolbar setting and animation-frame progress with a page view attached. Popup result delivery and closing tests also pass. The exact reported freeze has not been reproduced on the affected device.

This update does not resolve Google rejecting embedded browsers as unsafe. Compatibility mode cannot guarantee Google authentication. Android remains 0.6.1 and maintenance tools remain 1.3.1.

Closing the browser also tolerates popup views whose native web contents have already been destroyed, avoiding a main-process TypeError.
