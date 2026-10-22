# QA

Use Node.js 24+, `npm ci`, and Python with `cryptography` for the development-only local TLS fixture.

From the project root:

1. `python tests/generate-qa-cert.py`
2. Run `tests/run-windows.ps1` in PowerShell.

The test process uses a new temporary application profile and hidden windows. It does not read the user's browser profile, use real passwords, or sign in to a real account. Network tests bind only to loopback. The local certificate is accepted only by the test session and is never installed in Windows. Test files and certificates are excluded from the packaged application.

Expected rejection tests intentionally produce IPC error messages for a wrong master password, a locked vault and a mismatched origin. Success is determined by the exit code and qa-results.json, not by the absence of those expected messages.

Screenshots captured after native WebContentsView use may be incomplete in hidden mode; the separate UI visual review used an offscreen main window. Run visible manual checks for animation and actual website compatibility before distributing a release.

Language and opening checks: run `electron tests/language-opening.cjs` with a separate `VEYRA_QA_PROFILE` and `VEYRA_QA_OUTPUT`, then repeat with `--restore` and the same profile. These checks cover RU/UK/EN switching, native messages, tooltips, persistence across process restart, preservation of user bookmark titles and reduced-motion behavior.
