// SPDX-License-Identifier: GPL-3.0-or-later

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    describeCapture,
    formatCaptureSchedule,
    formatCaptureTime,
    parseQuickCapture,
} from '../extension/quick-capture.js';

const NOW = new Date(2026, 9, 31, 9, 30, 0);

test('plain text stays a task without a schedule', () => {
    const result = parseQuickCapture('Belajar GJS', NOW);
    assert.equal(result.text, 'Belajar GJS');
    assert.equal(result.due, null);
    assert.equal(result.dueDate, null);
    assert.equal(result.priority, null);
});

test('Indonesian relative date and clock are stripped from the title', () => {
    const result = parseQuickCapture('Telepon ibu besok jam 5', NOW);
    assert.equal(result.text, 'Telepon ibu');
    assert.equal(result.due, 5 * 60);
    assert.equal(result.dueDate, '2026-11-01');
    assert.equal(result.priority, null);
});

test('a period without a clock picks a sensible default time', () => {
    const result = parseQuickCapture('Rapat desain besok sore', NOW);
    assert.equal(result.text, 'Rapat desain');
    assert.equal(result.due, 16 * 60);
    assert.equal(result.dueDate, '2026-11-01');
});

test('English meridiem and at-phrases are understood', () => {
    const result = parseQuickCapture('Call mom at 5pm', NOW);
    assert.equal(result.text, 'Call mom');
    assert.equal(result.due, 17 * 60);
    assert.equal(result.dueDate, '2026-10-31');
});

test('a bare time in the past moves to tomorrow', () => {
    const result = parseQuickCapture('Olahraga jam 9', NOW);
    assert.equal(result.text, 'Olahraga');
    assert.equal(result.due, 9 * 60);
    assert.equal(result.dueDate, '2026-11-01');
});

test('an explicit today keeps a past time on today', () => {
    const result = parseQuickCapture('Review hari ini jam 9', NOW);
    assert.equal(result.text, 'Review');
    assert.equal(result.due, 9 * 60);
    assert.equal(result.dueDate, '2026-10-31');
});

test('weekday names resolve to the next occurrence', () => {
    const result = parseQuickCapture('Senin pagi olahraga', NOW);
    assert.equal(result.text, 'olahraga');
    assert.equal(result.due, 8 * 60);
    assert.equal(result.dueDate, '2026-11-02');
});

test('a trailing priority word is removed from the title', () => {
    const result = parseQuickCapture('Kirim laporan besok penting', NOW);
    assert.equal(result.text, 'Kirim laporan');
    assert.equal(result.dueDate, '2026-11-01');
    assert.equal(result.due, null);
    assert.equal(result.priority, 'high');
});

test('bang priorities work when attached to a word', () => {
    const result = parseQuickCapture('Bayar listrik !low', NOW);
    assert.equal(result.text, 'Bayar listrik');
    assert.equal(result.priority, 'low');
});

test('an explicit month and day becomes a future date', () => {
    const result = parseQuickCapture('Rapat 5 November jam 10', NOW);
    assert.equal(result.text, 'Rapat');
    assert.equal(result.due, 10 * 60);
    assert.equal(result.dueDate, '2026-11-05');
});

test('minutes are preserved in different spellings', () => {
    const result = parseQuickCapture('Telepon jam 17.30 lusa', NOW);
    assert.equal(result.text, 'Telepon');
    assert.equal(result.due, 17 * 60 + 30);
    assert.equal(result.dueDate, '2026-11-02');
});

test('an input made only of schedule words falls back to the raw text', () => {
    const result = parseQuickCapture('besok jam 8', NOW);
    assert.equal(result.text, 'besok jam 8');
    assert.equal(result.dueDate, '2026-11-01');
    assert.equal(result.due, 8 * 60);
});

test('empty input returns an empty result', () => {
    const result = parseQuickCapture('   ', NOW);
    assert.equal(result.text, '');
    assert.equal(result.dueDate, null);
});

test('schedule labels are short and human readable', () => {
    const result = parseQuickCapture('Telepon ibu besok jam 17', NOW);
    assert.equal(formatCaptureSchedule(result, NOW), 'Tomorrow · 17:00');
    assert.equal(describeCapture(result, NOW), 'Tomorrow · 17:00');
    assert.equal(formatCaptureTime(9 * 60 + 5), '09:05');
});
