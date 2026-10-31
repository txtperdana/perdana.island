// SPDX-License-Identifier: GPL-3.0-or-later

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    chooseMonitor,
    clampUnit,
    monitorForPoint,
    monitorKey,
    monitorsBounds,
    normalizeTabOrder,
    positionRatios,
    positionTarget,
    snapToMonitor,
} from '../extension/layout-utils.js';

const LEFT = {x: 0, y: 0, width: 1920, height: 1080, connector: 'eDP-1'};
const RIGHT = {x: 1920, y: 0, width: 1280, height: 720, connector: 'DP-2'};

test('normalizeTabOrder keeps valid keys, drops duplicates, and appends new pages', () => {
    const keys = new Set(['a', 'b', 'c', 'd']);
    assert.deepEqual(normalizeTabOrder(['b', 'x', 'b', 'a'], keys), ['b', 'a', 'c', 'd']);
    assert.deepEqual(normalizeTabOrder(['d', 'c', 'b', 'a'], keys), ['d', 'c', 'b', 'a']);
    assert.deepEqual(normalizeTabOrder(null, keys), ['a', 'b', 'c', 'd']);
    assert.deepEqual(normalizeTabOrder('a', keys), ['a', 'b', 'c', 'd']);
    assert.deepEqual(normalizeTabOrder([], []), []);
});

test('clampUnit clamps numbers and keeps the fallback for invalid input', () => {
    assert.equal(clampUnit(0.4), 0.4);
    assert.equal(clampUnit(-1), 0);
    assert.equal(clampUnit(2), 1);
    assert.equal(clampUnit('0.25'), 0.25);
    assert.equal(clampUnit('nope', 0.5), 0.5);
    assert.equal(clampUnit(undefined, 0.75), 0.75);
});

test('monitorKey prefers a connector and falls back to an index', () => {
    assert.equal(monitorKey(LEFT), 'eDP-1');
    assert.equal(monitorKey({get_connector: () => 'HDMI-1'}), 'HDMI-1');
    assert.equal(monitorKey({index: 2}), 'monitor-2');
    assert.equal(monitorKey({get_connector: () => null, index: 1}), 'monitor-1');
    assert.equal(monitorKey(null), '');
});

test('chooseMonitor resolves a saved connector and falls back safely', () => {
    const monitors = [LEFT, RIGHT];
    assert.equal(chooseMonitor(monitors, 'DP-2', LEFT), RIGHT);
    assert.equal(chooseMonitor(monitors, 'missing', RIGHT), RIGHT);
    assert.equal(chooseMonitor(monitors, 'missing', null), LEFT);
    assert.equal(chooseMonitor([], 'DP-2', LEFT), LEFT);
    assert.equal(chooseMonitor(null, 'DP-2', null), null);
});

test('monitorForPoint uses the containing monitor and otherwise the nearest one', () => {
    const monitors = [LEFT, RIGHT];
    assert.equal(monitorForPoint(monitors, 100, 100), LEFT);
    assert.equal(monitorForPoint(monitors, 2000, 100), RIGHT);
    assert.equal(monitorForPoint(monitors, 5000, 5000), RIGHT);
    assert.equal(monitorForPoint([], 10, 10), null);
});

test('monitorsBounds spans the whole layout', () => {
    assert.deepEqual(monitorsBounds([LEFT, RIGHT]),
        {x: 0, y: 0, width: 3200, height: 1080});
    assert.equal(monitorsBounds([]), null);
});

test('positionTarget handles every mode and clamps free placement', () => {
    const base = {monitor: LEFT, width: 900, height: 256};
    assert.deepEqual(positionTarget({...base, mode: 'top'}), {x: 510, y: 0});
    assert.deepEqual(positionTarget({...base, mode: 'top', pillOffset: 8}), {x: 510, y: 8});
    assert.deepEqual(positionTarget({...base, mode: 'bottom'}), {x: 510, y: 824});
    assert.deepEqual(positionTarget({...base, mode: 'left'}), {x: 0, y: 0});
    assert.deepEqual(positionTarget({...base, mode: 'right'}), {x: 1020, y: 0});
    assert.deepEqual(positionTarget({
        ...base, mode: 'free', positionX: 0.5, positionY: 0.5,
    }), {x: 510, y: 412});
    assert.deepEqual(positionTarget({
        ...base, mode: 'free', positionX: 2, positionY: -1,
    }), {x: 1020, y: 0});
    assert.deepEqual(positionTarget({...base, mode: 'nonsense'}), {x: 510, y: 0});
});

test('positionTarget works on a secondary monitor', () => {
    assert.deepEqual(positionTarget({
        monitor: RIGHT, width: 900, height: 256, mode: 'top',
    }), {x: 2110, y: 0});
    assert.deepEqual(positionTarget({
        monitor: RIGHT, width: 900, height: 256, mode: 'bottom',
    }), {x: 2110, y: 464});
});

test('positionRatios stores the position relative to the monitor', () => {
    assert.deepEqual(positionRatios({
        monitor: LEFT, x: 885, y: 0, width: 150, height: 38,
    }), {positionX: 0.5, positionY: 0});
    assert.deepEqual(positionRatios({
        monitor: LEFT, x: 1770, y: 1042, width: 150, height: 38,
    }), {positionX: 1, positionY: 1});
    assert.deepEqual(positionRatios({
        monitor: LEFT, x: -50, y: -50, width: 150, height: 38,
    }), {positionX: 0, positionY: 0});
});

test('snapToMonitor detects edges and keeps free placement ratios', () => {
    const base = {monitor: LEFT, width: 150, height: 38};
    assert.deepEqual(snapToMonitor({...base, x: 885, y: 0}),
        {mode: 'top', positionX: 0.5, positionY: 0});
    assert.deepEqual(snapToMonitor({...base, x: 885, y: 1042}),
        {mode: 'bottom', positionX: 0.5, positionY: 1});
    assert.deepEqual(snapToMonitor({...base, x: 0, y: 521}),
        {mode: 'left', positionX: 0, positionY: 0.5});
    assert.deepEqual(snapToMonitor({...base, x: 1770, y: 521}),
        {mode: 'right', positionX: 1, positionY: 0.5});
    assert.deepEqual(snapToMonitor({...base, x: 885, y: 521}),
        {mode: 'free', positionX: 0.5, positionY: 0.5});
    assert.equal(snapToMonitor({...base, x: 885, y: 500, threshold: 10}).mode, 'free');
});
