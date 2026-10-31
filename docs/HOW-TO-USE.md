# How to use Perdana Island

## Open and close

- Click the compact island at the top center to open it.
- When a media player or focus timer is active, hover over the island to open its page.
- Select a page from the tab bar. With the island open, use **Left / Right** to switch pages.
- Press **Escape** or click outside the panel to close it.
- Press **Ctrl+Alt+X** to hide or show the island, and **Ctrl+Alt+N** to open quick capture. Both shortcuts can be changed in GNOME Settings → Keyboard → Custom Shortcuts.

## Quick capture

Press **Ctrl+Alt+N** or select the **+** beside the clock to open a single field. Type the way you would say it, then press **Enter** to add a task, **Ctrl+Enter** to save it as a note, or **Escape** to close. The preview under the field shows the title that will be saved together with any date, time, and priority that were understood.

Examples:

| Type | Saved as |
| --- | --- |
| `Telepon ibu besok jam 5` | Task "Telepon ibu", tomorrow 05:00 |
| `Rapat desain besok sore` | Task "Rapat desain", tomorrow 16:00 |
| `Kirim laporan besok penting` | Task "Kirim laporan", tomorrow, high priority |
| `Bayar listrik !low` | Task "Bayar listrik", low priority |
| `Call mom at 5pm` | Task "Call mom", today 17:00 |
| `Rapat 5 November jam 10` | Task "Rapat", 5 November 10:00 |

Indonesian and English day names, `jam`/`pukul`, `besok`, `lusa`, `hari ini`, `pagi`, `siang`, `sore`, and `malam` are understood. A bare time that has already passed moves to tomorrow. Words that were only schedule or priority hints are removed from the title.

## Music

The Music page reads active players through MPRIS. It can show the title, artist, artwork, elapsed and total time, and playback controls. Click the progress bar to seek. Previous, Play/Pause, and Next are available when the active player exposes those capabilities. Smart detection checks player and track metadata so podcasts, films, social clips, and unclear sessions are ignored. Turn it off under **Settings → Music** if you want every media session to be eligible. Some browsers only publish media after playback has started.

## Lyrics

Open **Lyrics** while a player is active. The page shows album art, title, artist, playback controls, and lyrics that follow the player's position. If the player does not provide synced lyrics, Perdana Island looks them up from LRCLIB using the current track title, artist, optional album, and duration. Long lines wrap instead of truncating with an ellipsis.

## Focus

1. Choose **Focus**, **Short**, **Long**, or **Custom**.
2. For a custom session, enter a number, toggle the unit between seconds and minutes, then select **Apply**.
3. Select **Start**. The compact island shows the remaining time; hovering opens the Focus page.
4. Pause/resume, reset, or skip the current timer with its controls. When the timer finishes, a short completion notice appears.

Custom durations accept 1–86,400 seconds or 1–1,440 minutes. The page counts completed focus sessions for the current session.

## Shelf

Choose **Grid** or **List**. Grid shows image thumbnails; List shows filenames in rows. Scroll the Shelf area to browse up to 10 visible files. Select **Add files** to copy chosen files into Shelf. Use the folder button to open the Shelf directory. Files copied into that folder appear in Shelf automatically.

GNOME Shell does not expose the desktop's dragged file list to the island actors. Direct drag-and-drop onto the island is unsupported.

## To-do

Use **Add task** to create an item. Type naturally in quick capture, or use the To-do composer for an explicit time and priority. Select a task's check control to mark it complete or incomplete. Select **Edit** to show task deletion controls. Tasks with a date but no time show that day instead of a clock. The list is saved to `~/.local/share/perdana.island/tasks.json`.

## Notes

Notes is a quick scratchpad. Select **+** to create a note, then write in the editor on the right; the first line becomes the title in the list. Press **Enter** for a new line and **Escape** to leave the editor. Text saves to `~/.local/share/perdana.island/notes.json` about half a second after you stop typing. Use the trash control to delete a note; an **Undo** row stays available for seven seconds. Notes that are still empty when you leave the page are discarded.

## Clipboard

Clipboard records text changes while the extension is enabled, even when the island is collapsed or another page is selected. Open the Clipboard page to review up to four recent entries. Recopying an item already in the list moves that entry to the top instead of adding a duplicate. Repeated URLs are compared without differences in scheme/host capitalization, default ports, or a final root slash creating another row. Select a row to copy its original text again; use its delete control to remove it. Email addresses and links are masked in the preview, and clipboard data stays on this device. Explicitly marked password-manager MIME data and text matching credential patterns are skipped.

## Today and system notices

Today shows the local date and available CPU, memory, disk, and battery readings. Plugging in or removing the charger and changing output volume can show a brief system notice. Notices close automatically.

## Notifications

Open **Notifications** to review recent desktop notifications. Select a row to activate it and close the island. **Clear** dismisses the listed notifications from their applications. App banners can be filtered in **Settings → Notifications** for WhatsApp Web, Discord, Telegram Web/Desktop, and Google Chat when GNOME reports a recognizable source name. These switches affect Perdana Island only; they do not change GNOME's notification settings. A browser that reports only its own generic name cannot be separated by website. Hardware brightness keys can also show the current backlight level in an island OSD; GNOME still applies the brightness change.

## Settings

Settings are divided into six side sections:

- **Island** chooses the material, Notch or Pill shape, browser tuck-away, resting clock style, glass appearance, accent color, island position, and keep awake. Browser tuck-away shrinks the island when an overlapping browser is active and the pointer reaches the top edge; moving away restores it. Choose Top, Bottom, Left, Right, or Free, or drag the island by its resting pill or open header. Enter a hex color or choose a swatch. **Keep awake** asks the session manager to block idle and suspend until you turn it off; the inhibitor is released when the extension is disabled.
- **Greeting** controls the one-time welcome and returning-session message. Choose the Linux account name, device name, or enter a custom name. Edit the first sign-in and returning text; use `{name}` wherever the selected name should appear. Select either preview and click **Show on island** to see it. Greeting text is stored locally. The welcome appears the first time the feature runs; later desktop login sessions use the returning text. A manual preview counts as the greeting for the current session, preventing a duplicate automatic banner.
- **Music** toggles smart music detection. When enabled, metadata and player names help filter podcasts, films, social clips, and ambiguous video from the resting music state.
- **Reminders** controls morning agenda, evening recap, focus guard, water reminders, and prayer reminders, including city and calculation method.
- **Notifications** controls island banners and filters WhatsApp Web, Discord, Telegram Web/Desktop, and Google Chat. Clicking a banner activates the original desktop notification; replies are not sent from the island. GNOME's own notification banners are not changed.
- **Tabs** shows or hides feature pages in the bottom navigation. Settings remains available. Drag tabs in the bottom navigation to reorder them; the first visible tab becomes the page opened by a click on the resting island.

Each section scrolls independently if its controls exceed the available panel height. Settings and greeting preferences are saved locally.

## Data location

Tasks, notes, clipboard history, and Shelf files are in `~/.local/share/perdana.island/`. Task changes are also synchronized to `~/.local/share/pulo-island/tasks.json` for compatibility with the previous extension UUID. Task data from either location is reconciled on enable; Shelf files are copied from the previous location when a matching file is not already present.

Clipboard history is local and never sent to LRCLIB. Lyrics lookup sends the active track's title, artist, optional album, and duration to `lrclib.net`.
