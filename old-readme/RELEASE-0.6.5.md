# Veyra Windows 0.6.5 preview

The default browser banner now reads the Windows HTTP and HTTPS UserChoice entries. It recognizes VeyraURL across installations instead of depending only on Electron protocol registration. Returning from Windows Settings refreshes the result.

Google compatibility sessions retain their native User Agent, omit the page preload, leave page APIs unchanged and avoid attaching the DevTools protocol debugger. Disabled dark mode no longer attaches a debugger. Focus and virtual fullscreen overrides remain disabled on compatibility sites. Cookie and privacy header rewriting is skipped in the Google session.

The changes remove confirmed compatibility defects. Google can still block embedded browsers. Successful Google account login after the email step has not been verified and is not guaranteed.

Windows registry fixtures, native compatibility API tests, packaged build tests and the 14 core integration checks passed. Android remains 0.3.2. Installer 1.1.0 continues to preserve the browser profile. Executables are not Authenticode signed.
