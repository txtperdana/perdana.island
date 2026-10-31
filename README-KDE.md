# Perdana Island for KDE Plasma

[![KDE Plasma 6](https://img.shields.io/badge/KDE%20Plasma-6-1d99f3?logo=kde&logoColor=white)](https://develop.kde.org/docs/plasma/widget/)
[![Qt Quick and QML](https://img.shields.io/badge/UI-Qt%20Quick%20%2B%20QML-41cd52?logo=qt&logoColor=white)](https://doc.qt.io/qt-6/qtquick-index.html)
[![Kirigami](https://img.shields.io/badge/components-Kirigami-1d99f3?logo=kde&logoColor=white)](https://develop.kde.org/docs/getting-started/kirigami/)
[![MPRIS](https://img.shields.io/badge/media-MPRIS%20over%20D--Bus-383838)](https://specifications.freedesktop.org/mpris-spec/latest/)

This is the KDE Plasma 6 implementation of Perdana Island. It is a native Plasma widget that can sit in a panel or on the desktop. Its source and package metadata are in [`plasma-widget/`](plasma-widget/) on the same `main` branch as the GNOME extension, which remains in `extension/`. Both desktop packages use the shared project release version and are published as separate archives.

## What the KDE version includes

- **Music** reads the active player's MPRIS metadata and provides playback, previous/next, and seeking controls.
- **Focus** offers Focus, Short, Long, and custom timers in seconds or minutes. A finished session appears in the island and sends a Plasma notification.
- **Tasks** supports adding, completing, and deleting tasks. A task can carry a time and a priority (High, Med, Low), the list shows the next scheduled items, and the widget reports how many are scheduled and completed today. The list is saved in the widget configuration.
- **Daily agenda** can send a Plasma notification at 08:00 with the first scheduled tasks and a recap at 17:00 with the number completed today. Both are toggled in the widget settings.
- **Water reminder** can send a Plasma notification every hour between 08:00 and 21:00.
- **Prayer times** can fetch the five daily times from the Aladhan API for a city, cache them for the day, and notify at each time. The calculation method can be Kemenag, MWL, ISNA, or Umm al-Qura.
- **Reminders** lists the five prayer times for today, marks the next one, and dims the ones that have passed. The same page shows the water countdown with a **Log glass** action and a refresh button for the prayer times.
- **Themes** change the widget background, border, corners, and tab tint. Midnight, Aero, Aqua, Yaru, and Graphite are available in the settings.
- **Clipboard** keeps up to four recent plain-text entries while the widget is running. Entries can be copied again or deleted. A small heuristic skips text that resembles common labeled secrets or private-key blocks; it is not a complete secret detector.
- **Resting capsule** blinks and shows the clock when hovered.

The widget uses a compact panel representation and an expanded Plasma popup. It does not create the GNOME version's separate, centered top-edge overlay. It also does not follow the global pointer, auto-open when media starts, or include Shelf, system metrics, battery notices, or volume notices. Those features are not part of this KDE port yet. Focus guard and the GNOME screenshot button are also GNOME-only: the widget cannot read the active window without a KWin script, and it has no Shelf page to receive a capture.

No KDE runtime screenshots are published yet. The screenshots in the main README show the GNOME extension and do not represent this widget.

## Architecture

![KDE Plasma 6 applet](https://img.shields.io/badge/architecture-Plasma%206%20applet-1d99f3?logo=kde&logoColor=white)
![Qt Quick QML](https://img.shields.io/badge/UI-Qt%20Quick%20%2B%20QML-41cd52?logo=qt&logoColor=white)
![KConfig widget settings](https://img.shields.io/badge/persistence-Plasma%20widget%20configuration-555555)
![KNotifications](https://img.shields.io/badge/notifications-KNotifications-555555)

The applet is built with Qt Quick and QML using Plasma's compact and expanded representations. It reads media through Plasma's MPRIS QML model, stores tasks, clipboard history, and focus timer state in per-widget Plasma configuration, and uses KDE notifications when a focus session finishes. The package declares Plasma 6.0 as its minimum version, following KDE's [Plasma widget setup](https://develop.kde.org/docs/plasma/widget/setup/) guidance.

The media page imports `org.kde.plasma.private.mpris`. This is a Plasma-provided private QML module, so compatibility depends on that module being present in the installed Plasma build. The widget has not yet been runtime-validated across Plasma releases.

## Linux distribution compatibility

The package targets **KDE Plasma 6.0 or later**. It should be installable on a Linux distribution when its Plasma session provides the QML modules used by the applet and `kpackagetool6` is available. The current project environment has not runtime-tested the KDE widget on any distribution.

| Distribution family | Status |
| --- | --- |
| Fedora KDE Spin | Untested; requires Plasma 6 and the applet's QML modules. |
| KDE neon | Untested; requires Plasma 6 and the applet's QML modules. |
| Kubuntu | Untested; use a release that provides Plasma 6 and the applet's QML modules. |
| openSUSE | Untested; requires Plasma 6 and the applet's QML modules. |
| Arch Linux and derivatives | Untested; requires Plasma 6 and the applet's QML modules. |
| Other Linux distributions | Untested; should work when the same Plasma and QML requirements are met. |

These are compatibility targets, not confirmed distro support. KDE's [Plasma 6 porting guide](https://develop.kde.org/docs/plasma/widget/porting_kf6/) documents the metadata and API changes from Plasma 5.

## Install

The widget requires KDE Plasma 6 and the package manager `kpackagetool6`. Clone the repository and install the applet package from its root:

```sh
git clone https://github.com/txtperdana/perdana.island.git
cd perdana.island
kpackagetool6 --type=Plasma/Applet --install plasma-widget
```

For a packaged build, download the KDE Plasma archive from a Perdana Island GitHub release and pass that archive path to `kpackagetool6 --type=Plasma/Applet --install`.

In Plasma, enter panel or desktop edit mode, choose **Add Widgets**, search for **Perdana Island**, then drag it into the panel or onto the desktop. If you already have an earlier version installed, update its package with:

```sh
kpackagetool6 --type=Plasma/Applet --upgrade plasma-widget
```

## How to use

### Open the island and switch pages

- Click the capsule to open the expanded widget. Close it with Plasma's normal popup dismissal, such as **Escape** or clicking outside the popup.
- With the capsule focused, press **Enter** or **Space** to toggle it. The page buttons expose accessible names for keyboard and assistive-technology users.
- When resting, hover over the capsule to reveal the clock. When media is active, the capsule shows the track title and playback animation. A running focus timer shows its countdown. Clicking the capsule selects Music when a player is active, or Focus while a timer is running or its completion notice is visible.
- Use the five buttons along the bottom of the expanded widget to switch between **Music**, **Focus**, **Tasks**, **Clipboard**, and **Reminders**. The date and time appear in the header.

### Music

Start playback in a desktop media player that publishes an MPRIS player on D-Bus. Open Perdana Island and choose **Music**. The page displays the available artwork, track title, artist or player name, and playback position.

- Use the center button to play or pause.
- Use the side buttons to move to the previous or next track when the player supports those actions.
- Drag the progress slider to seek when the player supports seeking. The slider is disabled when seeking is unavailable.
- If the page says **Nothing is playing**, start playback in an MPRIS-compatible player. The widget does not start playback or open itself automatically.

### Focus timer

Open **Focus** and select one of the presets: **Focus** (25 minutes), **Short** (5 minutes), or **Long** (15 minutes). For a custom timer, enter a number from 1 to 180, choose **seconds** or **minutes**, then press **Custom** or **Apply**. The initial custom value is 30 seconds. Press **Start** to begin.

The countdown continues if the popup is closed. While it is running, the compact capsule shows the remaining time and the timer settings are disabled. The current controls do not pause or resume a running session: **Reset** stops it, and **Skip** ends it without marking it complete. When time runs out, the widget increments today's completed-session count, shows **Done** briefly, and sends a Plasma notification.

### Tasks

Open **Tasks**, type into **Add a task**, optionally fill the time field (`HH:MM`), choose a priority with the Prio button, then press **Enter** or click **Add**. The header shows how many tasks are scheduled today, the next time, and how many are done today. Use the checkbox to mark a task complete or incomplete; completed tasks are crossed out. Use the delete button on a task row to remove it. The widget supports up to 50 tasks.

Scheduled tasks show their time and priority on the row. A task whose date has passed is marked **Late** until it is completed.

### Reminders and themes

Open **Reminders** to see today's prayer times and the water countdown. The next prayer is highlighted, times that have passed are dimmed, and **Refresh** re-fetches the times for the configured city. The right side shows the next glass; press **Log glass** to restart the hourly countdown. When a reminder is turned off, that side of the page says so instead of showing times.

Right-click the widget, choose **Configure Perdana Island**, and use the settings page:

- **Theme** selects the widget material.
- **Morning briefing** and **Evening recap** control the daily agenda notifications.
- **Drink water** sends a reminder every hour between 08:00 and 21:00.
- **Prayer times** needs a city in the `City, Country` field and a calculation method. Times are cached for the current day, so the widget only calls the API once per day. The API returns times in the city's clock; pick a city in your own timezone.

### Clipboard

Newly copied plain text is recorded while the widget is running, including when the popup is closed. Open **Clipboard** to review the recent list. The widget keeps up to four entries, each of which can be copied again or deleted with its row buttons.

Clipboard history is plain text truncated to 1,200 characters. Text tagged with KDE's password-manager hint is skipped. A simple pattern check also skips text that resembles labeled passwords, secrets, tokens, API keys, authorization values, or private-key blocks. This is only a precaution, not a complete secret detector, so do not use the history for sensitive information.

### Saved data

The task list, clipboard history, focus settings, and daily focus count are stored in Plasma's configuration for that widget instance. Closing the popup does not clear them. Removing the widget may remove its instance configuration; copy out anything you want to keep before uninstalling or deleting its widget instance.

Remove it with:

```sh
kpackagetool6 --type=Plasma/Applet --remove perdana.island.plasma
```

Removing a Plasma applet may also remove its instance configuration. Save any task or clipboard content you need before removing it.

## References

- [KDE Plasma widget setup](https://develop.kde.org/docs/plasma/widget/setup/)
- [Porting Plasma widgets to KF6](https://develop.kde.org/docs/plasma/widget/porting_kf6/)
- [KDE notification QML type](https://api.kde.org/org-kde-notifications-qmlmodule.html)
- [MPRIS specification](https://specifications.freedesktop.org/mpris-spec/latest/)
