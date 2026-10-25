# Veyra 1.0.5 test release for Windows

This is a prerelease for testing. It does not replace the stable update feed.

- Fixes repeated registration of widget protocol handlers after clearing widget data.
- Fixes permission controls overflowing the Widget Studio inspector.
- Allows a user-confirmed attempt to open an external app link when Windows does not identify its protocol handler. It does not save a persistent permission for an unidentified app.

Google sign-in restrictions are unchanged. Some providers reject embedded browser sign-in; use a supported sign-in flow where available.
