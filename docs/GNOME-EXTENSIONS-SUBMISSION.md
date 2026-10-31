# GNOME Extensions submission

Perdana Island's GNOME package targets GNOME Shell 50 and 51 and is prepared as a separate upload from the KDE Plasma widget. The ZIP contains the extension metadata, JavaScript, stylesheet, GSettings schema XML, and GPL license.

## Build and check the ZIP

From the repository root:

```sh
gnome-extensions pack ./extension --extra-source=../LICENSE --extra-source=clipboard-utils.js --extra-source=quick-capture.js --force --out-dir ./dist
unzip -l ./dist/perdana.island@perdana.shell-extension.zip
```

The archive root should contain `metadata.json`, `extension.js`, `clipboard-utils.js`, `quick-capture.js`, `stylesheet.css`, `LICENSE`, and the schema XML in `schemas/`. GNOME compiles schemas when it installs extensions through its supported tools; the XML file itself must be included in the upload. Do not upload the KDE package or repository development files.

Run Shexli before uploading:

```sh
virtualenv venv
. venv/bin/activate
pip install -U shexli
shexli ./dist/perdana.island@perdana.shell-extension.zip
```

Review every warning manually. Clipboard access is a core feature and is declared in the extension description. Clipboard changes are observed while the extension is enabled; up to four unique entries are stored locally with email addresses and links masked in previews. Explicitly marked password-manager data and recognized credential formats are skipped. Clipboard text is not sent to third parties. LRCLIB lyric lookup sends the current track title, artist, optional album, and duration to `lrclib.net`.

## Upload

Upload the GNOME ZIP through the [GNOME Extensions developer form](https://extensions.gnome.org/upload/). GNOME controls the submission `version`; `version-name` is the project's display label. The package declares stable GNOME Shell 50 and 51 support and links to this repository for source and issue reports.

The site sends the review result by email. Local static checks do not guarantee approval; the final decision belongs to GNOME Extensions reviewers. Distributed extension content is also subject to the [GNOME Code of Conduct](https://conduct.gnome.org/).

## Compliance notes

- The extension is licensed under GPL-3.0-or-later, which is compatible with GNOME Shell's GPL-2.0-or-later terms.
- The ZIP has no helper scripts, binaries, preview pages, or development-only folders.
- The development environment is Fedora Linux 44, GNOME Shell 50.6 on Wayland. Ubuntu 26.10 with GNOME Shell 51.0 passed a headless Wayland smoke test covering enable/disable, every page, notices, and preferences. Other distributions and X11 have not been independently runtime-tested.
- Shexli may report advisories for direct clipboard access (manual review), small synchronous reads of user data and Linux `/proc`/`sysfs`, and signal handlers attached to actors destroyed with the extension's root widget. Review these against the source before each upload.
