# Install, update, and remove

## Requirements

- Linux with GNOME Shell **50.x or 51.x**.
- The `gnome-extensions` command, normally installed with GNOME Shell.
- A GNOME session. Wayland is the development-validated session; X11 has not been independently tested.

Check the running Shell version:

```sh
gnome-shell --version
```

If the major version is not 50 or 51, this release is outside its declared compatibility range.

## Build and install

Run these commands from the repository root:

```sh
mkdir -p dist
gnome-extensions pack ./extension --extra-source=./LICENSE --extra-source=clipboard-utils.js --extra-source=music-classifier.js --extra-source=backup-utils.js --out-dir ./dist
gnome-extensions install --force ./dist/perdana.island@perdana.shell-extension.zip
gnome-extensions enable perdana.island@perdana
```

You can also install the generated archive with the GNOME Extensions application or Extension Manager, then enable **Perdana Island**.

If `perdana.island@perdana` is not listed immediately after installing it, GNOME Shell has not rescanned extension folders for the new UUID. On Wayland, sign out and back in once, then enable the extension. This one-time scan is only needed when GNOME has not discovered the new UUID. Later JavaScript changes may also require a Shell session reload because GNOME can cache imported modules for the life of the session.

## Update

Pack and install a fresh archive:

```sh
gnome-extensions pack ./extension --extra-source=clipboard-utils.js --extra-source=music-classifier.js --extra-source=backup-utils.js --out-dir ./dist
gnome-extensions install --force ./dist/perdana.island@perdana.shell-extension.zip
gnome-extensions disable perdana.island@perdana
gnome-extensions enable perdana.island@perdana
```

If the running extension still shows the previous code, reload the GNOME Shell session. On Wayland, sign out and back in; on X11, **Alt+F2**, enter `r`, then press **Enter** usually reloads Shell.

## Replace the previous extension

The current UUID is `perdana.island@perdana`. If the earlier `pulo-island@perdana` extension is still installed, enable and verify the new extension, then disable the previous one:

```sh
gnome-extensions disable pulo-island@perdana
```

The extension reconciles `tasks.json` with `~/.local/share/pulo-island/tasks.json` and synchronizes task changes to both locations, so the list survives switching between extension UUIDs. Shelf files are copied to `~/.local/share/perdana.island/shelf/` when a matching destination is absent. Existing data is retained.

## Verify

```sh
gnome-extensions info perdana.island@perdana
```

After enabling, the output should show **Perdana Island**, version 70, and `State: ACTIVE`.

## Remove

```sh
gnome-extensions disable perdana.island@perdana
gnome-extensions uninstall perdana.island@perdana
```

Removal leaves data in `~/.local/share/perdana.island/` and the legacy task backup in `~/.local/share/pulo-island/`. Remove those directories manually only if you also want to delete saved tasks, clipboard history, and Shelf files.

## Troubleshooting

- **Rejected as incompatible:** check `gnome-shell --version`; this release declares GNOME Shell 50.x and 51.x.
- **Island does not appear:** enable **Perdana Island** and inspect `gnome-extensions info perdana.island@perdana`.
- **Rebuild appears unchanged:** GNOME Shell may have cached JavaScript; reload the Shell session as described above.
- **Music page is empty:** start a player that exports MPRIS metadata on the current user's session bus.
- **Files do not appear in Shelf:** use **Add files** or copy them to the Shelf folder. Direct drop onto the island is not available in GNOME Shell.

## Prepare a GNOME Extensions submission

The GNOME archive in a GitHub release is also the upload package for [extensions.gnome.org](https://extensions.gnome.org/upload/). It contains the extension source, metadata, stylesheet, and GPL license. The metadata declares GNOME Shell 50 and 51, links to this public repository, and describes the clipboard feature. Track title, artist, optional album, and duration are sent to LRCLIB when looking up lyrics; clipboard entries stay local.

Before upload, build and inspect the GNOME archive:

```sh
gnome-extensions pack ./extension --extra-source=./LICENSE --extra-source=clipboard-utils.js --extra-source=music-classifier.js --extra-source=backup-utils.js --out-dir ./dist
unzip -l ./dist/perdana.island@perdana.shell-extension.zip
```

GNOME assigns the website submission version. The project `version-name` is only a display label. Run the [Shexli static analyzer](https://gjs.guide/extensions/review-guidelines/review-guidelines.html) on the extension folder or ZIP, review all warnings, then upload the ZIP through the developer form. GNOME will send the review result by email; passing the static checks does not guarantee approval.
