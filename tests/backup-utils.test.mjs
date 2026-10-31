// SPDX-License-Identifier: GPL-3.0-or-later

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    BACKUP_APP,
    BACKUP_FORMAT,
    BackupError,
    backupFileName,
    buildBackup,
    describeBackupSummary,
    parseBackup,
} from '../extension/backup-utils.js';

const NOW = new Date(2026, 9, 31, 12, 0, 0);

test('a built backup round-trips through the parser', () => {
    const payload = buildBackup({
        preferences: {
            theme: 'aero',
            tabOrder: ['media', 'tasks', 'settings'],
            keepAwake: true,
            lastWaterAt: 42,
            greetingWelcomeShown: true,
        },
        tasks: [{id: 't1', text: 'Telepon ibu', due: 300, dueDate: '2026-11-01', priority: 'high'}],
        notes: [{id: 'n1', text: 'Ide rapat', updatedAt: 1000}],
        focusLog: {'2026-10-31': 1500},
    }, {version: 'v76', now: NOW});

    assert.equal(payload.app, BACKUP_APP);
    assert.equal(payload.format, BACKUP_FORMAT);
    assert.equal(payload.appVersion, 'v76');
    assert.equal(payload.data.preferences.keepAwake, undefined);
    assert.equal(payload.data.preferences.lastWaterAt, undefined);
    assert.equal(payload.data.preferences.greetingWelcomeShown, undefined);
    assert.equal(payload.data.preferences.theme, 'aero');

    const parsed = parseBackup(JSON.stringify(payload));
    assert.equal(parsed.tasks.length, 1);
    assert.equal(parsed.tasks[0].text, 'Telepon ibu');
    assert.equal(parsed.tasks[0].due, 300);
    assert.equal(parsed.notes.length, 1);
    assert.deepEqual(parsed.focusLog, {'2026-10-31': 1500});
    assert.deepEqual(parsed.summary, {tasks: 1, notes: 1, focusDays: 1, preferences: 2});
});

test('invalid task and note entries are dropped instead of failing the restore', () => {
    const payload = buildBackup({
        preferences: {},
        tasks: [
            {text: 'Keep me', due: 9999, dueDate: 'not-a-date', priority: 'urgent'},
            {text: '   '},
            {due: 120},
            'not a task',
        ],
        notes: [{text: ''}, {text: '   '}, {text: 'Real note', id: 7}],
        focusLog: {'2026-13-45': 10, 'yesterday': 20, '2026-10-31': -5, '2026-10-30': '60'},
    });

    const parsed = parseBackup(JSON.stringify(payload));
    assert.equal(parsed.tasks.length, 1);
    assert.equal(parsed.tasks[0].text, 'Keep me');
    assert.equal(parsed.tasks[0].due, null);
    assert.equal(parsed.tasks[0].dueDate, null);
    assert.equal(parsed.tasks[0].priority, null);
    assert.equal(parsed.notes.length, 1);
    assert.equal(parsed.notes[0].text, 'Real note');
    assert.deepEqual(parsed.focusLog, {'2026-10-30': 60});
});

test('files from other apps are rejected', () => {
    assert.throws(() => parseBackup(JSON.stringify({app: 'other', format: 1, data: {}}) ),
        BackupError);
});

test('a newer backup format asks for an update', () => {
    assert.throws(() => parseBackup(JSON.stringify({
        app: BACKUP_APP,
        format: BACKUP_FORMAT + 1,
        data: {tasks: [{text: 'x'}]},
    })), /newer version/);
});

test('broken and empty files get a readable error', () => {
    assert.throws(() => parseBackup(''), /empty/);
    assert.throws(() => parseBackup('not json'), /valid JSON/);
    assert.throws(() => parseBackup(JSON.stringify({app: BACKUP_APP, format: 1, data: {}})),
        /no island data/);
});

test('the default file name uses the local date', () => {
    assert.equal(backupFileName(NOW), 'perdana-island-backup-2026-10-31.json');
});

test('the summary reads like a sentence', () => {
    assert.equal(describeBackupSummary({tasks: 3, notes: 2, focusDays: 4, preferences: 8}),
        '3 tasks · 2 notes · 4 focus days · settings');
    assert.equal(describeBackupSummary({tasks: 1, notes: 1, focusDays: 0, preferences: 0}),
        '1 task · 1 note');
});
