# Veyra 1.1.3a for Windows

This quick fix improves tab restoration, resource reporting, and installation over an existing Veyra copy.

- Session snapshots now preserve page titles, so sleeping restored tabs do not show only their URLs.
- Restored pages remain queued one at a time and use the same memory sample as the Performance panel.
- Windows Performance now distinguishes private process memory from working set; CPU sampling no longer gets reset by a second metrics query.
- Auto Dark Mode batches DOM updates and ignores style mutations caused by its own recoloring, reducing repeat work on changing pages.
- Narrow tabs hide their title before hiding the close control, keeping the close button available in crowded tab strips.
- Installer 1.3.8 installs over the existing Veyra folder and preserves the profile and shortcuts. No uninstall is required.
- Three open/close passes against the Veyra Workers site peaked around 1.14 GB working set during first load, then returned to about 0.59 GB after close; no monotonic growth appeared in this bounded run. This is a regression check, not a guarantee against every site's memory use.
- Android 0.7.5 is included unchanged; this quick fix does not alter Android code.

The browser's signed automatic update manifest is a separate artifact. If it has not yet been refreshed, download Veyra Setup from the website and run it over the current installation.
