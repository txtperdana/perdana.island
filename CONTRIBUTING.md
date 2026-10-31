# Contributing to Perdana Island

Perdana Island ships two independent packages from one repository: a GNOME Shell 50 extension in `extension/` and a KDE Plasma 6 widget in `plasma-widget/`. The project uses one release number for both.

## Before you start

- Open an issue for a new feature or a behavior change so the approach can be discussed first.
- Keep GNOME and KDE changes in separate pull requests when possible.
- Report bugs with your desktop, distribution, session type, and the steps that reproduce the problem.

## Requirements

- Node.js 20 or newer for the unit tests.
- `zip` and `glib-compile-schemas` for packaging validation.
- GNOME Shell 50.x or 51.x and `gnome-extensions` for GNOME work.
- Plasma 6 and `kpackagetool6` for KDE work.

## Set up

Fork the repository on GitHub, then clone your fork:

```sh
git clone git@github.com:<your-user>/perdana.island.git
cd perdana.island
git switch -c fix/short-description
```

Use `fix/`, `feat/`, `docs/`, or `chore/` as the branch prefix.

## Test

Run the unit tests and the package validation before opening a pull request:

```sh
npm test
./scripts/validate.sh
```

`validate.sh` checks JavaScript syntax, JSON metadata, the GSettings schema, the shared GNOME/KDE version, and the contents of both release archives. Both commands also run in CI.

## GNOME development loop

`gnome-extensions pack` only includes known extension files, so extra root modules must be passed explicitly. The clipboard helpers use this path:

```sh
gnome-extensions pack ./extension \
  --extra-source=./LICENSE \
  --extra-source=clipboard-utils.js \
  --extra-source=layout-utils.js \
  --out-dir ./dist
gnome-extensions install --force ./dist/perdana.island@perdana.shell-extension.zip
gnome-extensions disable perdana.island@perdana
gnome-extensions enable perdana.island@perdana
```

On Wayland, sign out and back in when Shell keeps using cached modules. See [Installation](docs/INSTALLATION.md) for troubleshooting.

## KDE development loop

Install or upgrade the widget from the source directory:

```sh
kpackagetool6 --type Plasma/Applet --install plasma-widget
kpackagetool6 --type Plasma/Applet --upgrade plasma-widget
```

Restart Plasma Shell after a QML-only change:

```sh
systemctl --user restart plasma-plasmashell
```

## Versions and releases

Both packages share one version number:

- `extension/metadata.json` uses `"version-name": "v<number>"`.
- `plasma-widget/metadata.json` uses `"Version": "<number>"`.
- Release notes live in `docs/releases/v<number>.md`.

A maintainer tags `v<number>` after both metadata files and the release notes are ready. The release workflow builds and publishes the GNOME and KDE archives.

## Code style

- GNOME code is GJS with ES modules, four-space indentation, semicolons, and single quotes.
- QML uses four-space indentation and keeps page UI in `plasma-widget/contents/ui/pages/`.
- Keep functions focused and name them after what they do.
- Add a comment only when it explains why something is done, a platform constraint, or a non-obvious edge case.
- Do not add runtime dependencies without discussing them first.
- Keep clipboard, task, and shelf data local unless a change is documented and reviewed for privacy.

## Pull requests

- Keep the change focused on one problem and describe the user-visible effect.
- Add or update tests when behavior changes.
- List the distributions and desktop versions you tested.
- Include screenshots for visible GNOME or KDE changes.
- Update the README, usage guide, or release notes when behavior or data handling changes.
- Confirm that your contribution can be distributed under GPL-3.0-or-later.

## License

By contributing, you agree that your changes are licensed under the project's [GPL-3.0-or-later](LICENSE) license.
