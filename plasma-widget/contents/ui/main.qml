pragma ComponentBehavior: Bound

import QtQuick
import QtQuick.Layouts
import QtQuick.Controls as QQC2
import org.kde.plasma.plasmoid
import org.kde.plasma.core as PlasmaCore
import org.kde.plasma.private.mpris as Mpris
import org.kde.kirigami as Kirigami
import org.kde.kquickcontrolsaddons as KQuickControlsAddons
import org.kde.notification

PlasmoidItem {
    id: root

    signal clipboardHistoryChanged()

    Layout.preferredWidth: 152
    Layout.preferredHeight: 34
    switchWidth: 480
    switchHeight: 270
    Plasmoid.backgroundHints: PlasmaCore.Types.NoBackground
    Plasmoid.icon: hasMedia ? (isPlaying ? "media-playback-playing" : "media-playback-paused") : "applications-multimedia"
    toolTipMainText: "Perdana Island"
    toolTipSubText: hasMedia ? mediaTitle : "Click to open the island"

    property string currentPage: "music"
    property var now: new Date()
    property int taskRevision: 0
    property bool focusFinishedNotice: false
    property var equalizerHeights: [5, 12, 8, 15]
    property var prayerRequest: null
    property real prayerRetryAt: 0

    readonly property var themePresets: ({
        midnight: { background: "#050506", border: "#1b1c20", tab: "#25272d", hover: "#17181c", accent: "#5577b8", radius: 27, compactRadius: 17 },
        aero: { background: "#0c2136", border: "#4f86b8", tab: "#1d3a55", hover: "#132c45", accent: "#8fc4ef", radius: 24, compactRadius: 14 },
        aqua: { background: "#16171a", border: "#3c4048", tab: "#2b2e35", hover: "#1e2024", accent: "#c3c9d6", radius: 32, compactRadius: 18 },
        yaru: { background: "#2a0a1d", border: "#5e2547", tab: "#43142f", hover: "#371026", accent: "#c76bb0", radius: 27, compactRadius: 17 },
        graphite: { background: "#15171a", border: "#2c3037", tab: "#24272d", hover: "#1b1d21", accent: "#8b93a0", radius: 20, compactRadius: 12 }
    })
    readonly property var theme: themePresets[Plasmoid.configuration.theme] || themePresets.midnight
    readonly property var taskPriorities: ["high", "medium", "low"]
    readonly property var taskPriorityLabels: ({ high: "High", medium: "Med", low: "Low" })
    readonly property var prayerNames: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
    readonly property var prayerMethods: [[20, "Kemenag"], [3, "MWL"], [2, "ISNA"], [4, "Umm al-Qura"]]
    readonly property int waterWindowStart: 480
    readonly property int waterWindowEnd: 1260
    readonly property int waterIntervalMs: 3600000

    readonly property var player: mprisModel.currentPlayer
    readonly property bool hasMedia: player !== null && player !== undefined && player.playbackStatus > Mpris.PlaybackStatus.Stopped
    readonly property bool isPlaying: hasMedia && player.playbackStatus === Mpris.PlaybackStatus.Playing
    readonly property string mediaTitle: hasMedia ? (player.track || "Unknown title") : ""
    readonly property string mediaArtist: hasMedia ? (player.artist || player.identity || "") : ""
    readonly property string mediaArt: hasMedia ? (player.artUrl || "") : ""

    function formattedTime(date) {
        return Qt.locale().toString(date, "h:mm AP")
    }

    function formattedDate(date) {
        return Qt.locale().toString(date, "ddd, d MMM")
    }

    function formatDuration(seconds) {
        const value = Math.max(0, Math.floor(Number(seconds) || 0));
        const minutes = Math.floor(value / 60);
        const remainder = value % 60;
        return minutes + ":" + (remainder < 10 ? "0" : "") + remainder;
    }

    function dateKey(date) {
        return Qt.formatDate(date, "yyyy-MM-dd");
    }

    function formatClock(minutes) {
        const value = Math.max(0, Math.min(1439, Math.round(Number(minutes) || 0)));
        return (value < 600 ? "0" : "") + Math.floor(value / 60) + ":" + (value % 60 < 10 ? "0" : "") + (value % 60);
    }

    function normalizeTask(task) {
        return {
            text: String(task.text || ""),
            done: Boolean(task.done),
            doneAt: typeof task.doneAt === "string" ? task.doneAt : "",
            due: Number.isInteger(task.due) ? task.due : null,
            dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
            priority: taskPriorities.indexOf(task.priority) >= 0 ? task.priority : null
        };
    }

    function readTasks() {
        try {
            const tasks = JSON.parse(Plasmoid.configuration.tasksJson || "[]");
            return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
        } catch (error) {
            return [];
        }
    }

    function saveTasks(tasks) {
        Plasmoid.configuration.tasksJson = JSON.stringify(tasks);
        taskRevision += 1;
    }

    function addTask(text, due, priority) {
        const value = String(text || "").trim();
        if (!value)
            return;
        const tasks = readTasks();
        const minutes = Number.isInteger(due) ? due : null;
        tasks.unshift({
            text: value.slice(0, 120),
            done: false,
            doneAt: "",
            due: minutes,
            dueDate: minutes === null ? "" : dateKey(new Date()),
            priority: taskPriorities.indexOf(priority) >= 0 ? priority : null
        });
        saveTasks(tasks.slice(0, 50));
    }

    function setTaskDone(index, done) {
        const tasks = readTasks();
        if (index < 0 || index >= tasks.length)
            return;
        tasks[index].done = done;
        tasks[index].doneAt = done ? new Date().toISOString() : "";
        saveTasks(tasks);
    }

    function agendaTasks(key) {
        const day = key || dateKey(new Date());
        return readTasks()
            .filter(task => !task.done && task.dueDate === day && task.due !== null)
            .sort((first, second) => first.due - second.due);
    }

    function tasksDoneToday() {
        const today = dateKey(new Date());
        return readTasks().filter(task =>
            task.done && task.doneAt && dateKey(new Date(task.doneAt)) === today);
    }

    function splitCity(value) {
        const text = String(value || "").trim();
        if (!text)
            return ["", "Indonesia"];
        const parts = text.split(",");
        const city = parts.shift().trim();
        const country = parts.join(",").trim() || "Indonesia";
        return [city, country];
    }

    function prayerTimesToday() {
        try {
            const cache = JSON.parse(Plasmoid.configuration.prayerCache || "{}");
            if (!cache || cache.date !== dateKey(new Date()) || !cache.times)
                return null;
            const city = splitCity(Plasmoid.configuration.prayerCity)[0];
            if (cache.city !== city || Number(cache.method) !== Number(Plasmoid.configuration.prayerMethod))
                return null;
            return cache.times;
        } catch (error) {
            return null;
        }
    }

    function fetchPrayerTimes() {
        if (prayerRequest || Date.now() < prayerRetryAt)
            return;
        const parts = splitCity(Plasmoid.configuration.prayerCity);
        if (!parts[0])
            return;
        const date = Qt.formatDate(new Date(), "dd-MM-yyyy");
        const url = "https://api.aladhan.com/v1/timingsByCity/" + date
            + "?city=" + encodeURIComponent(parts[0])
            + "&country=" + encodeURIComponent(parts[1])
            + "&method=" + Number(Plasmoid.configuration.prayerMethod || 20);
        const request = new XMLHttpRequest();
        prayerRequest = request;
        request.onreadystatechange = function () {
            if (request.readyState !== XMLHttpRequest.DONE)
                return;
            root.prayerRequest = null;
            if (request.status !== 200) {
                root.prayerRetryAt = Date.now() + 900000;
                return;
            }
            try {
                const payload = JSON.parse(request.responseText);
                const timings = payload.data.timings;
                const times = {};
                for (const name of root.prayerNames) {
                    const match = String(timings[name] || "").match(/^(\d{1,2}):(\d{2})/);
                    if (match)
                        times[name] = Number(match[1]) * 60 + Number(match[2]);
                }
                Plasmoid.configuration.prayerCache = JSON.stringify({
                    date: root.dateKey(new Date()),
                    city: parts[0],
                    method: Number(Plasmoid.configuration.prayerMethod || 20),
                    times
                });
            } catch (error) {
                // Keep the previous cache when the response is not usable.
                root.prayerRetryAt = Date.now() + 900000;
            }
        };
        request.open("GET", url);
        request.send();
    }

    function refreshPrayerTimes() {
        prayerRetryAt = 0;
        fetchPrayerTimes();
    }

    function prayerPageSubtitle() {
        if (!Plasmoid.configuration.prayerReminder)
            return "Prayer reminders are off";
        if (prayerRequest)
            return "Loading prayer times...";
        if (!prayerTimesToday())
            return "No prayer times yet";
        const parts = splitCity(Plasmoid.configuration.prayerCity);
        const method = prayerMethods.find(entry => Number(entry[0]) === Number(Plasmoid.configuration.prayerMethod));
        return (parts[0] || "No city") + " · " + (method ? method[1] : "Kemenag");
    }

    function waterSummary(date) {
        if (!Plasmoid.configuration.waterReminder)
            return { caption: "Reminder", value: "Off", detail: "Turn on in Settings" };
        const minutes = date.getHours() * 60 + date.getMinutes();
        if (minutes < root.waterWindowStart)
            return { caption: "Next glass", value: "08:00", detail: "Quiet hours until then" };
        if (minutes >= root.waterWindowEnd)
            return { caption: "Next glass", value: "08:00", detail: "Resumes tomorrow" };
        // lastWaterAt is stored in milliseconds by the widget.
        const last = Number(Plasmoid.configuration.lastWaterAt || 0);
        if (!last)
            return { caption: "Next glass", value: "Now", detail: "No glass logged yet" };
        const lastDate = new Date(last);
        const lastLabel = root.formatClock(lastDate.getHours() * 60 + lastDate.getMinutes());
        const remaining = Math.min(root.waterIntervalMs, Math.max(0, last + root.waterIntervalMs - date.getTime()));
        return {
            caption: "Next glass",
            value: remaining <= 0 ? "Now" : Math.ceil(remaining / 60000) + " min",
            detail: "Last glass " + lastLabel
        };
    }

    function checkReminders() {
        const now = root.now;
        const today = root.dateKey(now);
        const minutes = now.getHours() * 60 + now.getMinutes();
        const agenda = root.agendaTasks(today);

        if (Plasmoid.configuration.morningAgenda && minutes >= 480 && minutes < 720
                && Plasmoid.configuration.lastAgendaBriefing !== today) {
            if (agenda.length) {
                agendaNotification.title = agenda.length + (agenda.length === 1 ? " task today" : " tasks today");
                agendaNotification.text = agenda.slice(0, 2)
                    .map(task => root.formatClock(task.due) + " " + task.text).join(" · ");
                agendaNotification.sendEvent();
            }
            Plasmoid.configuration.lastAgendaBriefing = today;
        }

        if (Plasmoid.configuration.eveningRecap && minutes >= 1020 && minutes < 1260
                && Plasmoid.configuration.lastAgendaRecap !== today) {
            const done = root.tasksDoneToday().length;
            if (done) {
                recapNotification.title = "Day recap";
                recapNotification.text = done + (done === 1 ? " task done" : " tasks done");
                recapNotification.sendEvent();
            }
            Plasmoid.configuration.lastAgendaRecap = today;
        }

        const nowMs = now.getTime();
        if (Plasmoid.configuration.waterReminder && minutes >= waterWindowStart && minutes < waterWindowEnd
                && nowMs - Number(Plasmoid.configuration.lastWaterAt || 0) >= waterIntervalMs) {
            waterNotification.sendEvent();
            Plasmoid.configuration.lastWaterAt = String(nowMs);
        }

        if (!Plasmoid.configuration.prayerReminder)
            return;
        const times = root.prayerTimesToday();
        if (!times) {
            root.fetchPrayerTimes();
            return;
        }
        for (const name of root.prayerNames) {
            if (times[name] !== minutes)
                continue;
            const key = today + ":" + name;
            if (Plasmoid.configuration.lastPrayerNotice === key)
                break;
            prayerNotification.title = name + " " + root.formatClock(times[name]);
            prayerNotification.text = "Prayer time";
            prayerNotification.sendEvent();
            Plasmoid.configuration.lastPrayerNotice = key;
            break;
        }
    }

    function deleteTask(index) {
        const tasks = readTasks();
        if (index < 0 || index >= tasks.length)
            return;
        tasks.splice(index, 1);
        saveTasks(tasks);
    }

    function readClipboardHistory() {
        try {
            const items = JSON.parse(Plasmoid.configuration.clipboardHistory || "[]");
            return Array.isArray(items) ? items : [];
        } catch (error) {
            return [];
        }
    }

    function saveClipboardHistory(items) {
        Plasmoid.configuration.clipboardHistory = JSON.stringify(items.slice(0, 4));
    }

    function addClipboardText(text) {
        const value = String(text || "").trim();
        if (!value)
            return;
        if (/(?:password|passwd|pwd|passphrase|secret|client[ _-]?secret|(?:api|access|refresh)[ _-]?(?:key|token)|token|authorization|private[ _-]?key)\s*[:=]/i.test(value)
                || /-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(value))
            return;
        const entry = value.slice(0, 1200);
        const items = readClipboardHistory().filter(item => item.text !== entry);
        items.unshift({ text: entry, copiedAt: Date.now() });
        saveClipboardHistory(items);
    }

    function copyClipboardText(text) {
        systemClipboard.content = String(text || "");
    }

    function captureClipboardText() {
        const availableFormats = systemClipboard.formats || [];
        const isPasswordManager = availableFormats.some(format =>
            String(format).toLowerCase() === "application/x-kde-passwordmanagerhint");
        if (isPasswordManager || availableFormats.indexOf("text/plain") < 0)
            return;
        const copied = String(systemClipboard.content || "").trim();
        if (!copied)
            return;
        addClipboardText(copied);
        clipboardHistoryChanged();
    }

    function focusRemainingSeconds() {
        const startedAt = Number(Plasmoid.configuration.focusStartedAt || 0);
        if (startedAt <= 0)
            return focusFinishedNotice ? 0 : Number(Plasmoid.configuration.focusSeconds || 0);
        return Math.max(0, Number(Plasmoid.configuration.focusSeconds || 0) - Math.floor((root.now.getTime() - startedAt) / 1000));
    }

    function finishFocusSession() {
        Plasmoid.configuration.focusStartedAt = "0";
        const today = Qt.locale().toString(new Date(), "yyyy-MM-dd");
        const sameDay = Plasmoid.configuration.focusSessionsDate === today;
        Plasmoid.configuration.focusSessionsToday = sameDay ? Number(Plasmoid.configuration.focusSessionsToday) + 1 : 1;
        Plasmoid.configuration.focusSessionsDate = today;
        focusFinishedNotice = true;
        focusNoticeTimer.restart();
        focusNotification.sendEvent();
    }

    function skipFocusSession() {
        Plasmoid.configuration.focusStartedAt = "0";
    }

    function pageSource(page) {
        switch (page) {
        case "focus": return Qt.resolvedUrl("pages/FocusPage.qml");
        case "tasks": return Qt.resolvedUrl("pages/TasksPage.qml");
        case "clipboard": return Qt.resolvedUrl("pages/ClipboardPage.qml");
        case "reminders": return Qt.resolvedUrl("pages/RemindersPage.qml");
        default: return Qt.resolvedUrl("pages/MusicPage.qml");
        }
    }

    onExpandedChanged: {
        if (expanded && player)
            player.updatePosition();
    }

    Mpris.Mpris2Model {
        id: mprisModel
    }

    KQuickControlsAddons.Clipboard {
        id: systemClipboard
        onContentChanged: root.captureClipboardText()
    }

    Notification {
        id: focusNotification
        componentName: "plasma_workspace"
        eventId: "notification"
        title: "Focus session complete"
        text: "Your timer has finished. Take a short break."
        iconName: "chronometer"
    }

    Notification {
        id: agendaNotification
        componentName: "plasma_workspace"
        eventId: "notification"
        title: ""
        text: ""
        iconName: "x-office-calendar"
    }

    Notification {
        id: recapNotification
        componentName: "plasma_workspace"
        eventId: "notification"
        title: "Day recap"
        text: ""
        iconName: "chronometer"
    }

    Notification {
        id: waterNotification
        componentName: "plasma_workspace"
        eventId: "notification"
        title: "Drink water"
        text: "Time for a glass of water."
        iconName: "chronometer"
    }

    Notification {
        id: prayerNotification
        componentName: "plasma_workspace"
        eventId: "notification"
        title: ""
        text: "Prayer time"
        iconName: "x-office-calendar"
    }

    Connections {
        target: Plasmoid.configuration
        function onWaterReminderChanged() {
            if (Plasmoid.configuration.waterReminder)
                Plasmoid.configuration.lastWaterAt = String(Date.now());
        }
        function onPrayerReminderChanged() {
            if (Plasmoid.configuration.prayerReminder)
                root.fetchPrayerTimes();
        }
    }

    Timer {
        interval: 15000
        running: true
        repeat: true
        onTriggered: {
            root.now = new Date();
            root.checkReminders();
        }
    }

    Timer {
        interval: 1000
        running: Number(Plasmoid.configuration.focusStartedAt || 0) > 0
        repeat: true
        onTriggered: {
            root.now = new Date();
            if (root.focusRemainingSeconds() <= 0)
                root.finishFocusSession();
        }
    }

    Timer {
        id: focusNoticeTimer
        interval: 4500
        onTriggered: root.focusFinishedNotice = false
    }

    Timer {
        interval: 180
        running: root.isPlaying
        repeat: true
        onTriggered: root.equalizerHeights = [4 + Math.random() * 12, 4 + Math.random() * 12, 4 + Math.random() * 12, 4 + Math.random() * 12]
    }

    compactRepresentation: Item {
        id: compact
        implicitWidth: root.hasMedia ? 208 : 152
        implicitHeight: 34
        Layout.preferredWidth: implicitWidth
        Layout.preferredHeight: implicitHeight
        focus: true
        activeFocusOnTab: true
        Accessible.role: Accessible.Button
        Accessible.name: "Open Perdana Island"
        Keys.onReturnPressed: root.expanded = !root.expanded
        Keys.onSpacePressed: root.expanded = !root.expanded

        property bool hovered: compactMouse.containsMouse
        property bool blinking: false

        Rectangle {
            anchors.fill: parent
            radius: root.theme.compactRadius
            color: root.theme.background
            border.color: compact.activeFocus ? "#f5f5f7" : root.theme.border
            border.width: compact.activeFocus ? 2 : 1
        }

        Row {
            anchors.fill: parent
            anchors.leftMargin: 14
            anchors.rightMargin: 14
            spacing: 9
            visible: root.hasMedia

            Image {
                anchors.verticalCenter: parent.verticalCenter
                width: 23
                height: 23
                source: root.mediaArt
                fillMode: Image.PreserveAspectCrop
                visible: root.mediaArt.length > 0
                asynchronous: true
                sourceSize.width: 46
                sourceSize.height: 46
            }

            Text {
                anchors.verticalCenter: parent.verticalCenter
                width: compact.width - 90
                text: root.mediaTitle
                color: "#f5f5f7"
                font.pixelSize: 12
                elide: Text.ElideRight
                verticalAlignment: Text.AlignVCenter
            }

            Row {
                anchors.verticalCenter: parent.verticalCenter
                height: 18
                spacing: 2
                Repeater {
                    model: 4
                    Rectangle {
                        required property int index
                        width: 3
                        height: root.isPlaying ? root.equalizerHeights[index] : 4
                        anchors.verticalCenter: parent.verticalCenter
                        radius: 2
                        color: "#f5f5f7"
                    }
                }
            }
        }

        Row {
            anchors.centerIn: parent
            spacing: 12
            visible: !root.hasMedia

            Row {
                anchors.verticalCenter: parent.verticalCenter
                spacing: 5
                visible: !compact.hovered && !root.focusFinishedNotice && Number(Plasmoid.configuration.focusStartedAt || 0) <= 0
                Repeater {
                    model: 2
                    Rectangle {
                        width: 8
                        height: compact.blinking ? 2 : 16
                        radius: 4
                        color: "#f5f5f7"
                        Behavior on height { NumberAnimation { duration: 85; easing.type: Easing.OutQuad } }
                    }
                }
            }

            Text {
                anchors.verticalCenter: parent.verticalCenter
                visible: compact.hovered
                    && Number(Plasmoid.configuration.focusStartedAt || 0) <= 0
                    && !root.focusFinishedNotice
                text: root.formattedTime(root.now)
                color: "#f5f5f7"
                font.pixelSize: 14
                font.weight: Font.DemiBold
            }

            Text {
                anchors.verticalCenter: parent.verticalCenter
                visible: Number(Plasmoid.configuration.focusStartedAt || 0) > 0
                text: root.formatDuration(root.focusRemainingSeconds())
                color: "#ff9f43"
                font.pixelSize: 13
                font.weight: Font.DemiBold
            }

            Text {
                anchors.verticalCenter: parent.verticalCenter
                visible: root.focusFinishedNotice
                text: "Done"
                color: "#ff9f43"
                font.pixelSize: 12
                font.weight: Font.DemiBold
            }
        }

        MouseArea {
            id: compactMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: {
                if (root.hasMedia)
                    root.currentPage = "music";
                else if (Number(Plasmoid.configuration.focusStartedAt || 0) > 0 || root.focusFinishedNotice)
                    root.currentPage = "focus";
                root.expanded = !root.expanded;
            }
        }

        Timer {
            interval: 3200
            repeat: true
            running: !root.hasMedia
                     && Number(Plasmoid.configuration.focusStartedAt || 0) <= 0
                     && !compact.hovered
            onTriggered: {
                compact.blinking = true;
                eyeBlinkTimer.restart();
                interval = 2500 + Math.floor(Math.random() * 3500);
            }
        }

        Timer {
            id: eyeBlinkTimer
            interval: 115
            onTriggered: compact.blinking = false
        }
    }

    fullRepresentation: Item {
        id: popup
        Layout.minimumWidth: 480
        Layout.preferredWidth: 480
        Layout.maximumWidth: 480
        Layout.minimumHeight: 270
        Layout.preferredHeight: 270
        Layout.maximumHeight: 270

        Rectangle {
            anchors.fill: parent
            radius: root.theme.radius
            color: root.theme.background
            border.color: root.theme.border
            border.width: 1
            clip: true

            Text {
                x: 24
                y: 17
                text: root.formattedDate(root.now)
                color: "#92939a"
                font.pixelSize: 12
            }

            Text {
                anchors.right: parent.right
                anchors.rightMargin: 24
                y: 17
                text: root.formattedTime(root.now)
                color: "#f1f1f3"
                font.pixelSize: 12
                font.weight: Font.Medium
                font.family: "monospace"
            }

            Rectangle {
                id: contentFrame
                x: 22
                y: 47
                width: parent.width - 44
                height: 171
                color: "transparent"
                clip: true

                Loader {
                    id: pageLoader
                    anchors.fill: parent
                    source: root.pageSource(root.currentPage)
                    opacity: 1
                    onLoaded: item.island = root
                }

                SequentialAnimation {
                    id: pageTransition
                    NumberAnimation { target: pageLoader; property: "opacity"; to: 0; duration: 75; easing.type: Easing.OutQuad }
                    ScriptAction { script: pageLoader.source = root.pageSource(root.currentPage) }
                    NumberAnimation { target: pageLoader; property: "opacity"; to: 1; duration: 145; easing.type: Easing.OutQuad }
                }

                Connections {
                    target: root
                    function onCurrentPageChanged() { pageTransition.restart(); }
                }
            }

            Row {
                anchors.horizontalCenter: parent.horizontalCenter
                y: 226
                spacing: 7

                Repeater {
                    model: [
                        { key: "music", text: "Music", icon: "media-playback-start", activeWidth: 96 },
                        { key: "focus", text: "Focus", icon: "chronometer", activeWidth: 96 },
                        { key: "tasks", text: "Tasks", icon: "view-task", activeWidth: 96 },
                        { key: "clipboard", text: "Clipboard", icon: "edit-paste", activeWidth: 122 },
                        { key: "reminders", text: "Reminders", icon: "appointment-soon", activeWidth: 132 }
                    ]

                    delegate: QQC2.Button {
                        id: tabButton
                        required property var modelData
                        readonly property bool active: root.currentPage === modelData.key
                        width: active ? modelData.activeWidth : 36
                        height: 32
                        text: modelData.text
                        Accessible.name: modelData.text
                        background: Rectangle {
                            radius: 16
                            color: tabButton.active ? root.theme.tab : tabButton.hovered ? root.theme.hover : "transparent"
                            border.width: tabButton.activeFocus ? 2 : 0
                            border.color: "#f3f3f5"
                            Behavior on color { ColorAnimation { duration: 120 } }
                        }
                        Behavior on width { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }

                        contentItem: Row {
                            anchors.centerIn: parent
                            spacing: 7
                            Kirigami.Icon {
                                width: 16
                                height: 16
                                source: tabButton.modelData.icon
                                color: "#f3f3f5"
                            }
                            Text {
                                visible: tabButton.active
                                text: tabButton.modelData.text
                                color: "#f3f3f5"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                            }
                        }
                        onClicked: root.currentPage = modelData.key
                    }
                }
            }
        }
    }
}
