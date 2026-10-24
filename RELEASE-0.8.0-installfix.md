# Veyra 0.8.0 Windows installation fix

The original Windows ZIP used a directory name that the installer could not recognize. This corrected package uses the expected Veyra-win32-x64 directory. Browser files, version 0.8.0, and the Android release are unchanged.

Existing installers automatically download this corrected package. Close the installer and open it again to retry. Your browser profile is preserved.

Release packaging now uses scripts/archive-windows.py. Before publication, installer/TEST-RELEASE-ARCHIVE.ps1 extracts the actual release ZIP using the shipped installer assembly. Windows CI performs this check too.
