# Perdana Island

[![GNOME Shell 50 and 51](https://img.shields.io/badge/GNOME%20Shell-50%20%7C%2051-4a86cf?logo=gnome&logoColor=white)](https://extensions.gnome.org/)
[![GJS](https://img.shields.io/badge/runtime-GJS%20%2F%20JavaScript-f1e05a?logo=javascript&logoColor=111)](https://gjs.guide/)
[![St and Clutter](https://img.shields.io/badge/UI-St%20%2B%20Clutter-5267a8)](https://gnome.pages.gitlab.gnome.org/gnome-shell/st/)
[![MPRIS](https://img.shields.io/badge/media-MPRIS%20over%20D--Bus-383838)](https://specifications.freedesktop.org/mpris-spec/latest/)
[![Fedora 44](https://img.shields.io/badge/validated-Fedora%2044-51a2da?logo=fedora&logoColor=white)](https://fedoraproject.org/)

Perdana Island provides separate native packages for GNOME Shell and KDE Plasma. The GNOME Shell 50 and 51 extension places media controls, synced lyrics, a focus timer, a file shelf, tasks, quick notes, recent clipboard text, notifications, settings, and system information in a compact Notch or floating Pill. The KDE Plasma 6 widget provides Music, Focus, Tasks, Clipboard, and Reminders pages, plus daily agenda and reminder notifications. Both packages live in this repository, in `extension/` and `plasma-widget/` respectively, and share the project release version while keeping their code and installation packages separate. On GNOME, **Ctrl+Alt+X** hides or shows the island.

See [README-KDE.md](README-KDE.md) for KDE requirements, limitations, installation, and usage. Each GitHub release attaches one GNOME extension archive and one KDE Plasma widget archive. Install only the archive for your desktop environment.

## Current version: v76

Version 76 corrects the Plus Jakarta Sans helper text: the extension uses the system font when available and falls back to Cantarell when it is not. It includes the Spotify and lyric fixes from v75. See the [v76 change notes](docs/releases/v76.md).

## Feature previews

These images show representative UI states with sample media, files, notifications, and system values. A running extension reads those values from the current desktop session; the screenshots are not runtime captures.

| Feature | Preview |
| --- | --- |
| Resting island | ![Resting island with pointer eyes](assets/screenshots/resting.png) |
| Resting lyrics | ![Optional synced lyric in the compact resting island](assets/screenshots/resting-lyrics.png) |
| Music controls | ![Music page with cover art, playback controls, and track progress](assets/screenshots/music.png) |
| Lyrics | ![Lyrics page with track details, transport controls, and the active synced line](assets/screenshots/lyrics.png) |
| Focus timer | ![Focus page with presets and custom timer controls](assets/screenshots/focus.png) |
| Shelf grid | ![Shelf Grid view with file thumbnails](assets/screenshots/shelf.png) |
| Shelf list | ![Shelf List view with filenames](assets/screenshots/shelf-list.png) |
| To-do | ![To-do page with task completion and editing controls](assets/screenshots/todo.png) |
| Notes | ![Notes page with a note list and a wrapping editor](assets/screenshots/notes.png) |
| Clipboard | ![Clipboard history with masked email and link previews](assets/screenshots/clipboard.png) |
| Today | ![Today calendar with processor, memory, disk, and battery indicators](assets/screenshots/today.png) |
| Notifications | ![Recent notifications with Clear all and app activation controls](assets/screenshots/notifications.png) |
| Settings | ![Settings for appearance, greetings, reminders, and visible tabs](assets/screenshots/settings.png) |
| Charging notice | ![Charging notice with battery level](assets/screenshots/notice-charging.png) |
| Charger disconnected | ![Charger disconnected notice](assets/screenshots/notice-disconnected.png) |
| Volume notice | ![Output volume notice](assets/screenshots/notice-volume.png) |

## Features

- Resting eyes react to the pointer; settings choose between a clock on hover and eyes beside a visible clock. **Ctrl+Alt+X** hides or shows the island.
- Playing media and a running focus timer appear in compact form. Hovering opens the matching page.
- Music uses MPRIS metadata and supports seeking, previous, play/pause, and next when the player exposes those controls.
- Smart music detection checks player service and track metadata before showing playback. It recognizes common music services such as Spotify, YouTube Music, YouTube, Deezer, SoundCloud, and Apple Music, while filtering spoken programs, films, social video, and ambiguous sessions. Turn it off under **Settings → Music**.
- Lyrics follow playback timestamps. When a player does not provide synced lyrics, the extension looks up track metadata with LRCLIB. The Lyrics page includes playback controls and a toggle to show the current lyric in the resting island; long lines wrap inside the fixed layout.
- Focus offers Focus, Short, Long, and custom durations in seconds or minutes. Completion shows a temporary notice. While a session runs, Focus guard checks the focused window and shows one notice after five minutes in YouTube, Netflix, Twitch, TikTok, Instagram, Facebook, Reddit, or X. It reads only the window class and title, keeps the counter in memory, and can be turned off in Settings.
- Shelf offers Grid and List views, image thumbnails, a scrollable list capped at 10 visible items, and a local folder that refreshes when files change. A capture button saves the current screen into that folder through the desktop screenshot portal.
- To-do supports adding, completing, editing, and deleting tasks. Tasks persist between sessions. A task can carry a time (24 hour) and a priority (High, Med, Low); timed tasks sort to the top, and the list marks tasks whose day has passed as late.
- Clipboard keeps up to four recent text entries between sessions. It records changes while the extension is enabled, deduplicates repeated text and URLs, masks email addresses and links in previews, and skips explicitly identified credentials.
- To-do also shows a daily summary: scheduled tasks with the next time, tasks completed today, focus minutes, and a Copy report action that puts a plain text report on the clipboard.
- At 08:00 the island can show a morning agenda notice with today's scheduled tasks, and at 17:00 a recap of completed tasks and focus minutes. Clicking either notice opens the matching page. Both are toggled under Daily agenda in Settings.
- Notes is a local scratchpad with a list on the left and a wrapping editor on the right. The first line becomes the row title, **Enter** starts a new line, **Escape** leaves the editor, and text saves to `notes.json` shortly after typing stops. Deleting a note leaves a seven second Undo row, and empty notes are dropped when the page is left.
- Settings are split into **Island**, **Greeting**, **Music**, **Reminders**, **Notifications**, and **Tabs** side sections. They control themes, Notch/Pill shape, browser tuck, resting style, glass, accent color, notices, app notification filters, smart music detection, keep awake, greeting text and name, reminders, and visible page tabs.
- Drag tabs to change their order; the chosen order persists and the first visible tab becomes the default page when opening the island. Drag the island by its resting pill or open header to place it at the top, bottom, left, right, or a free position. Drag it onto another monitor to move it there; the saved position follows that monitor's connector. Settings → Island also has position choices.
- Page changes, tab selection, playback progress, focus ring, notices, and controls use short transitions and follow GNOME's reduced-motion preference.
- Keep awake asks GNOME's session manager for idle and suspend inhibitors while it is on. The switch is under Island and the inhibitor is released as soon as it is turned off or the extension is disabled.
- Themes change the island material without touching the layout. Midnight is the plain black island, Aero adds a blue gloss band with a hairline border, Aqua uses rounded translucent graphite, Yaru uses an aubergine tint, and Graphite uses flat grey with small corners. The choice persists between sessions, and translucent themes hide the solid corner ears so the glass edge stays clean.
- Water reminders can show a short notice every hour between 08:00 and 21:00 while the island is idle.
- Prayer reminders fetch the five daily times from the Aladhan API for a city, cache them per day, and show a notice at each time. The calculation method can be switched between Kemenag, MWL, ISNA, and Umm al-Qura. Times are converted from the city timezone to the local clock.
- The Reminders page lists the five prayer times for today, marks the next one, dims the ones that have passed, and shows the water countdown with a Log glass action. Tapping a water or prayer notice opens the page. Refresh re-fetches the times when the city or the connection changes.
- Today combines a local calendar with available CPU, memory, disk, and battery information.
- Notifications lists recent desktop notifications, uses the source application's icon when available, and can activate or clear them.
- Session greetings show a customizable first-use welcome and a returning greeting on later desktop login sessions. Choose the Linux account name, device name, or a custom name; edit both messages with `{name}` as the insertion token; preview either message from Settings. Greetings can be disabled independently of other system notices.
- Charging, charger disconnect, output-volume changes, hardware brightness changes, and completed focus sessions can show short notices.

## Architecture

![GNOME Shell extension architecture badges](https://img.shields.io/badge/architecture-GNOME%20Shell%20extension-4a86cf?logo=gnome&logoColor=white)
![GJS ES modules](https://img.shields.io/badge/modules-GJS%20ES%20modules-f1e05a?logo=javascript&logoColor=111)
![GLib and Gio](https://img.shields.io/badge/system-GLib%20%2B%20Gio-555555)
![Gvc audio](https://img.shields.io/badge/audio-Gvc%20%2B%20Shell%20VolumeStatus-555555)

The extension runs inside GNOME Shell through the GJS `Extension` lifecycle. Its interface is built from Shell `St` actors and Clutter layouts/animations, attached to GNOME Shell's chrome layer. GLib and Gio provide timers, file access, and filesystem monitoring. Media metadata and playback controls use MPRIS on the session D-Bus; output volume uses GNOME's Gvc mixer API and Shell volume status module. CPU, memory, disk, and battery readings are collected from Linux system interfaces when available.

The GNOME extension declares GNOME Shell **50.x and 51.x** compatibility. This GNOME package does not run on KDE Plasma, Cinnamon, Xfce, or other desktop environments that do not use GNOME Shell. The separate KDE widget and its requirements are documented in [README-KDE.md](README-KDE.md).

| Distribution / release | GNOME Shell | Support status |
| --- | --- | --- |
| Fedora Linux 44 | 50.6 on the development system | Runtime validated on Wayland |
| Ubuntu 26.04 LTS | 50.1 package | Version checked; runtime not independently tested |
| Debian testing (Forky) | 50.4 package | Version checked; runtime not independently tested |
| Ubuntu 26.10 | 51.0 on the test system | Enable/disable, every page, notices, agenda notices, theme switching, and preferences smoke-tested in a headless Wayland session |
| Other Linux distributions | GNOME Shell 50.x or 51.x required | Expected to work; not individually tested |

GNOME Shell 49 and earlier, and 52 or later, are outside the compatibility range declared by this release. Wayland is the validated session; X11 has not been independently tested.

## Install

See [Installation](docs/INSTALLATION.md) for requirements, build/install, update, removal, and troubleshooting steps.

Quick install from this repository:

```sh
mkdir -p dist
gnome-extensions pack ./extension --extra-source=../LICENSE --extra-source=clipboard-utils.js --out-dir ./dist
gnome-extensions install --force ./dist/perdana.island@perdana.shell-extension.zip
gnome-extensions enable perdana.island@perdana
```

## Platform packages and releases

The repository keeps each desktop implementation in its own directory. Release tags use one shared project version, while the release contains separate installable archives:

- `Perdana-Island-GNOME-v76.shell-extension.zip` for GNOME Shell and GNOME Extensions submission.
- `Perdana-Island-KDE-Plasma-v76.zip` for KDE Plasma 6.

The archive versions follow the tag and package metadata. Pushing a `v*` tag runs the release workflow, checks both package versions, compiles the GNOME settings schema, builds separate archives, and publishes the matching `docs/releases/<tag>.md` notes on GitHub. KDE installation and usage details are in [README-KDE.md](README-KDE.md). To prepare the v76 archives locally, run `./scripts/package-release.sh v76`.

## Use

Click the island to open it. When media or a focus timer is active, hovering over the island opens its page. Select a page from the tab bar. Press **Escape**, click outside, or move the pointer away to close it. See [How to use](docs/HOW-TO-USE.md) for each page's controls.

## Data and limitations

Tasks, notes, preferences, clipboard history, and Shelf files are stored in `~/.local/share/perdana.island/`. Task data is reconciled with `~/.local/share/pulo-island/tasks.json` and synchronized to both locations, so changes survive switching between the old and new extension UUIDs. Shelf files are copied from the previous location when a matching destination file is absent. Clipboard history is stored locally with user-only permissions and limited to four unique entries. It is monitored while the extension is enabled; repeated copies do not create duplicate rows. Clipboard text is not sent to third parties. LRCLIB lyric lookup sends the current track title, artist, optional album, and duration to `lrclib.net`.

GNOME Shell does not provide the dragged desktop file list to these island actors. Add files through **Add files**, or copy them into the Shelf folder; direct drop onto the island is unavailable.

## Repository layout

```text
extension/                 GNOME Shell extension source
plasma-widget/             KDE Plasma 6 widget source and package metadata
assets/screenshots/        Feature preview images
docs/                      Product requirements, usage, and installation guides
README-KDE.md              KDE Plasma 6 widget guide
CONTRIBUTING.md            Development setup, tests, and contribution rules
.github/workflows/         Validation and release workflows
scripts/                   Local validation and release packaging scripts
```

The GNOME extension is distributed under [GPL-3.0-or-later](LICENSE), a license compatible with GNOME Shell's GPL-2.0-or-later terms. For the EGO package and submission checklist, see [GNOME Extensions submission](docs/GNOME-EXTENSIONS-SUBMISSION.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development loop, tests, packaging, and version rules. Use the issue templates for bug reports and feature requests.

## Contributions and credits

### [Perdana (@txtperdana)](https://github.com/txtperdana)

- **GNOME foundation:** created the Shell extension lifecycle, top-attached island, resting and expanded states, responsive page widths, tab navigation, and transitions. Built Music controls over MPRIS, LRCLIB lyric lookup and sync, the focus timer, Shelf file handling, To-do, local clipboard history, Today metrics, desktop notices, and Settings.
- **Persistence and migration:** added local storage for tasks and clipboard history, carried task and Shelf data forward from the former `pulo-island` data folder, and maintained settings across extension sessions.
- **KDE port:** created the separate Plasma 6 widget, its supported Music, Focus, Tasks, and Clipboard pages, and KDE-specific installation, usage, and compatibility documentation. Kept GNOME and KDE code and archives separate while aligning their release versions.
- **Project maintenance:** owns product direction, design reviews, release packaging, versioning, screenshots, README/PRD/how-to guides, and integration of community changes. Reviewed and merged contributor work while preserving attribution in this README.
- **v70:** implemented first-session and returning-session greetings; added account, device, and custom display-name choices; editable welcome and return text with a `{name}` token; preview buttons; and once-per-login greeting state. Split Settings into Island, Greeting, Reminders, and Tabs side sections, with scroll-safe content in each section.
- **v71:** added configurable MPRIS music classification to keep podcasts, movies, social videos, and ambiguous media out of the music island; refined Notes spacing and safe insets; and guarded Keep awake against delayed session-manager replies.
- **v72:** added Settings → Notifications controls for app banners from WhatsApp, Discord, Telegram Web/Desktop, and Google Chat; added Notch/Pill shape selection, browser-overlap tuck-away, and a hardware brightness OSD. GNOME retains control of desktop notifications and brightness changes.
- **v73:** ported motion and responsive transition behavior from PR #12; added reorderable tabs and persistent island placement from PR #13; separated smart music detection into Settings → Music; and synchronized the GNOME and KDE package version metadata. The KDE widget's features are unchanged.
- **v74:** adds persistent font selection for Cantarell, Noto Sans, and Plus Jakarta Sans; Plus Jakarta Sans falls back to Cantarell when not installed. Fixes pointer-exit auto-close for click-opened islands. The KDE widget's features are unchanged.
- **v75:** prevents song titles mentioning films from hiding known music services, strips soundtrack attribution from lyric-search titles, and retries LRCLIB 5xx service errors. KDE package version aligned.
- **v76:** clarifies the Plus Jakarta Sans setting so it no longer says installation is required; the system font is used when available and Cantarell remains the fallback. KDE package version aligned.

### mteguhfh

The following merged pull requests add the contributions below:

- [PR #1 — Clipboard privacy](https://github.com/txtperdana/perdana.island/pull/1): masks dotted email addresses more completely and skips explicitly named API keys, access and refresh tokens, generic token fields, client secrets, authorization values, and private-key blocks. The checks target credential-shaped fields rather than treating ordinary copied text as a password.
- [PR #2 — Contribution workflow](https://github.com/txtperdana/perdana.island/pull/2): adds the contributor guide, bug-report and feature-request templates, and pull-request template.
- [PR #3 — KDE clipboard monitoring](https://github.com/txtperdana/perdana.island/pull/3): records clipboard changes while the widget is running even when its popup is closed; skips KDE password-manager MIME data; truncates long text safely; and moves a recopied item to the top of the history.
- [PR #4 — GNOME Shell 51](https://github.com/txtperdana/perdana.island/pull/4): replaces the removed `St.BoxLayout.vertical` property with `Clutter.Orientation.VERTICAL`, supporting both declared GNOME Shell 50 and 51 versions.
- [PR #5 — v69 packaging](https://github.com/txtperdana/perdana.island/pull/5): prepares the v69 release metadata and separate GNOME Shell and KDE Plasma archives with matching version numbers and documentation.
- [PR #6 — GNOME themes](https://github.com/txtperdana/perdana.island/pull/6): adds Midnight, Aero, Aqua, Yaru, and Graphite materials, with theme-specific surface colors, gloss, borders, and corner treatments.
- [PR #7 — Daily agenda and recap](https://github.com/txtperdana/perdana.island/pull/7): adds scheduled tasks, morning agenda and evening recap notices, completed-today counts, focus-minute totals, and a copyable daily report.
- [PR #8 — Shelf capture and focus guard](https://github.com/txtperdana/perdana.island/pull/8): adds screenshot capture through the desktop portal and warns once after five minutes in a supported distraction app while a focus session is active.
- [PR #9 — Water and prayer reminders](https://github.com/txtperdana/perdana.island/pull/9): adds hourly water reminders, configurable prayer-time reminders fetched from Aladhan, city and calculation-method settings, a Reminders page, and a daily cache.
- [PR #10 — KDE feature parity](https://github.com/txtperdana/perdana.island/pull/10): brings daily agenda, water and prayer reminders, and the five themes to the Plasma widget, with KDE-native settings and notifications.
- [PR #11 — Notes and keep awake](https://github.com/txtperdana/perdana.island/pull/11): adds a Notes page with a wrapping editor, autosave to `notes.json`, a seven second delete undo, empty-note cleanup, a tighter tab bar that fits the extra page, and a Keep awake switch that holds idle and suspend inhibitors and releases them when turned off or when the extension is disabled.

The following PRs were reviewed and adapted into the v73 codebase rather than merged directly. Both were closed after their v70-era branches diverged from the newer `main` branch and GitHub reported merge conflicts:

- [PR #12 — Fluid motion](https://github.com/txtperdana/perdana.island/pull/12) (**closed, not merged**): its motion work is adapted in v73, including reduced-motion-aware island/page transitions, animated tab selection and controls, smoother playback progress and lyrics movement, and lighter focus-ring repainting.
- [PR #13 — Custom layout](https://github.com/txtperdana/perdana.island/pull/13) (**closed, not merged**): its layout work is adapted in v73, including drag-reordering tabs, persisting the first-tab opening behavior, dragging the island to screen edges or a free position, and position choices under Settings → Island. PR #13 was built on PR #12, so both branches were ported together against the current code.
