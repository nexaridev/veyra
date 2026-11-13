# Veyra 1.0.10 quick fix

Windows release focused on the new tab customization controls and session restoration. Customize now opens once, the home page has a single Done control, and restored background tabs are loaded one at a time with a memory threshold to avoid a burst of simultaneous page loads. Android remains at 0.7.2.

Verification: `npm test`, Windows package build, release ZIP extraction through the shipped installer. The Windows executables are not Authenticode signed.
