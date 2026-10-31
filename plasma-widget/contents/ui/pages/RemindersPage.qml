import QtQuick
import "../components" as Island

Item {
    id: page
    property var island

    readonly property real layoutScale: Math.min(1, width / 600)
    readonly property real gap: Math.round(26 * layoutScale)
    readonly property real leftWidth: Math.round((width - gap) * 0.56)
    readonly property real rightX: leftWidth + gap
    readonly property real rightWidth: Math.max(0, width - rightX)
    readonly property var times: island && island.Plasmoid.configuration.prayerReminder
                                 ? island.prayerTimesToday() : null
    readonly property var nowDate: island ? island.now : new Date()
    readonly property int nowMinutes: nowDate.getHours() * 60 + nowDate.getMinutes()
    readonly property var summary: island ? island.waterSummary(nowDate)
                                          : ({ caption: "", value: "", detail: "" })
    readonly property string nextName: {
        if (!island || !times)
            return "";
        for (const name of island.prayerNames) {
            if (times[name] !== undefined && times[name] > nowMinutes)
                return name;
        }
        return "";
    }

    function prayerTime(name) {
        if (!island || !times || times[name] === undefined)
            return "—";
        return island.formatClock(times[name]);
    }

    function prayerColor(name) {
        if (nextName === name)
            return "#ffffff";
        if (times && times[name] !== undefined && times[name] <= nowMinutes)
            return "#5f6169";
        return "#b9bbc3";
    }

    onIslandChanged: {
        if (island && island.Plasmoid.configuration.prayerReminder && !island.prayerTimesToday())
            island.fetchPrayerTimes();
    }

    Text {
        x: 0
        y: 0
        text: "Reminders"
        color: "#f3f3f5"
        font.pixelSize: 19
        font.weight: Font.DemiBold
    }

    Text {
        x: 0
        y: 26
        width: Math.max(0, page.leftWidth - 76)
        text: island ? island.prayerPageSubtitle() : ""
        color: "#92939a"
        font.pixelSize: 10
        elide: Text.ElideRight
    }

    Island.PillButton {
        visible: island && island.Plasmoid.configuration.prayerReminder
        x: page.leftWidth - width
        y: 2
        implicitHeight: 26
        text: "Refresh"
        iconName: "view-refresh"
        Accessible.name: "Fetch prayer times again"
        onClicked: island.refreshPrayerTimes()
    }

    Repeater {
        model: island ? island.prayerNames : []

        delegate: Item {
            id: prayerRow
            required property int index
            required property var modelData
            y: 50 + index * 22
            width: page.leftWidth
            height: 20

            Text {
                anchors.left: parent.left
                anchors.verticalCenter: parent.verticalCenter
                text: prayerRow.modelData
                color: page.prayerColor(prayerRow.modelData)
                font.pixelSize: 12
                font.weight: page.nextName === prayerRow.modelData ? Font.DemiBold : Font.Normal
            }

            Text {
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                text: page.prayerTime(prayerRow.modelData)
                color: page.prayerColor(prayerRow.modelData)
                font.pixelSize: 12
                font.weight: page.nextName === prayerRow.modelData ? Font.DemiBold : Font.Normal
                horizontalAlignment: Text.AlignRight
            }
        }
    }

    Rectangle {
        x: page.leftWidth + Math.round(page.gap / 2)
        y: 0
        width: 1
        height: 158
        color: "#22242a"
    }

    Text {
        x: page.rightX
        y: 0
        text: "Water"
        color: "#92939a"
        font.pixelSize: 10
        font.weight: Font.DemiBold
    }

    Text {
        x: page.rightX
        y: 18
        width: page.rightWidth
        text: page.summary.caption
        color: "#92939a"
        font.pixelSize: 10
    }

    Text {
        x: page.rightX
        y: 30
        width: page.rightWidth
        text: page.summary.value
        color: "#ffffff"
        font.pixelSize: 26
        font.weight: Font.DemiBold
    }

    Text {
        x: page.rightX
        y: 66
        width: page.rightWidth
        text: page.summary.detail
        color: "#92939a"
        font.pixelSize: 10
        elide: Text.ElideRight
    }

    Island.PillButton {
        x: page.rightX
        y: 92
        width: Math.min(112, page.rightWidth)
        accented: true
        text: "Log glass"
        Accessible.name: "Log a glass of water"
        onClicked: {
            if (!island)
                return;
            island.Plasmoid.configuration.lastWaterAt = String(Date.now());
        }
    }

    Text {
        x: page.rightX
        y: 132
        width: page.rightWidth
        text: island ? "Every hour, " + island.formatClock(island.waterWindowStart)
                       + "–" + island.formatClock(island.waterWindowEnd) : ""
        color: "#5f6169"
        font.pixelSize: 9
    }
}
