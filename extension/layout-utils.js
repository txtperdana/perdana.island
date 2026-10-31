// SPDX-License-Identifier: GPL-3.0-or-later

export const POSITION_MODES = ['top', 'bottom', 'left', 'right', 'free'];

export function normalizeTabOrder(value, pageKeys) {
    const keys = pageKeys instanceof Set ? pageKeys : new Set(pageKeys || []);
    const order = [];
    for (const key of Array.isArray(value) ? value : []) {
        if (keys.has(key) && !order.includes(key))
            order.push(key);
    }
    for (const key of keys) {
        if (!order.includes(key))
            order.push(key);
    }
    return order;
}

export function clampUnit(value, fallback = 0) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return fallback;
    return Math.min(1, Math.max(0, number));
}

export function monitorKey(monitor) {
    if (!monitor)
        return '';
    if (typeof monitor.connector === 'string' && monitor.connector)
        return monitor.connector;
    try {
        const connector = monitor.get_connector?.();
        if (connector)
            return String(connector);
    } catch (_error) {
        // Fall through to the index-based key.
    }
    if (Number.isInteger(monitor.index))
        return `monitor-${monitor.index}`;
    return '';
}

export function chooseMonitor(monitors, preferredKey = '', fallback = null) {
    const list = Array.isArray(monitors) ? monitors.filter(Boolean) : [];
    if (!list.length)
        return fallback || null;
    if (preferredKey) {
        const match = list.find(monitor => monitorKey(monitor) === preferredKey);
        if (match)
            return match;
    }
    if (fallback && list.includes(fallback))
        return fallback;
    return list[0];
}

export function monitorForPoint(monitors, x, y) {
    const list = Array.isArray(monitors) ? monitors.filter(Boolean) : [];
    if (!list.length)
        return null;
    const inside = list.find(monitor => x >= monitor.x && x < monitor.x + monitor.width
        && y >= monitor.y && y < monitor.y + monitor.height);
    if (inside)
        return inside;
    let best = null;
    let bestDistance = Infinity;
    for (const monitor of list) {
        const centerX = monitor.x + monitor.width / 2;
        const centerY = monitor.y + monitor.height / 2;
        const distance = (x - centerX) ** 2 + (y - centerY) ** 2;
        if (distance < bestDistance) {
            best = monitor;
            bestDistance = distance;
        }
    }
    return best;
}

export function monitorsBounds(monitors) {
    const list = Array.isArray(monitors) ? monitors.filter(Boolean) : [];
    if (!list.length)
        return null;
    const left = Math.min(...list.map(monitor => monitor.x));
    const top = Math.min(...list.map(monitor => monitor.y));
    const right = Math.max(...list.map(monitor => monitor.x + monitor.width));
    const bottom = Math.max(...list.map(monitor => monitor.y + monitor.height));
    return {x: left, y: top, width: right - left, height: bottom - top};
}

export function positionTarget({
    monitor,
    width,
    height,
    mode = 'top',
    positionX = 0.5,
    positionY = 0,
    pillOffset = 0,
}) {
    if (!monitor)
        return {x: 0, y: 0};
    const actorWidth = Math.max(0, Number(width) || 0);
    const actorHeight = Math.max(0, Number(height) || 0);
    const safeMode = POSITION_MODES.includes(mode) ? mode : 'top';
    const spanX = Math.max(0, monitor.width - actorWidth);
    const spanY = Math.max(0, monitor.height - actorHeight);
    const centeredX = monitor.x + Math.round(spanX / 2);
    const preferredX = safeMode === 'top' || safeMode === 'bottom'
        ? centeredX
        : monitor.x + Math.round(spanX * clampUnit(positionX, 0.5));
    const preferredY = monitor.y + Math.round(spanY * clampUnit(positionY, 0));
    let x = preferredX;
    let y = preferredY;
    if (safeMode === 'top') {
        x = centeredX;
        y = monitor.y + Math.max(0, Number(pillOffset) || 0);
    } else if (safeMode === 'bottom') {
        x = centeredX;
        y = monitor.y + monitor.height - actorHeight;
    } else if (safeMode === 'left') {
        x = monitor.x;
    } else if (safeMode === 'right') {
        x = monitor.x + monitor.width - actorWidth;
    }
    return {
        x: Math.max(monitor.x, Math.min(monitor.x + spanX, x)),
        y: Math.max(monitor.y, Math.min(monitor.y + spanY, y)),
    };
}

export function positionRatios({monitor, x, y, width, height}) {
    if (!monitor)
        return {positionX: 0.5, positionY: 0};
    const spanX = Math.max(1, monitor.width - width);
    const spanY = Math.max(1, monitor.height - height);
    return {
        positionX: clampUnit((x - monitor.x) / spanX, 0.5),
        positionY: clampUnit((y - monitor.y) / spanY, 0),
    };
}

export function snapToMonitor({
    monitor,
    x,
    y,
    width,
    height,
    threshold = 44,
}) {
    if (!monitor)
        return {mode: 'free', positionX: 0.5, positionY: 0};
    const distances = {
        top: y - monitor.y,
        bottom: monitor.y + monitor.height - (y + height),
        left: x - monitor.x,
        right: monitor.x + monitor.width - (x + width),
    };
    let mode = 'free';
    let nearest = threshold;
    for (const edge of ['top', 'bottom', 'left', 'right']) {
        if (distances[edge] <= nearest) {
            nearest = distances[edge];
            mode = edge;
        }
    }
    return {mode, ...positionRatios({monitor, x, y, width, height})};
}
