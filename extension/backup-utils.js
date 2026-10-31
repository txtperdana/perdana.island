// SPDX-License-Identifier: GPL-3.0-or-later

// Backup files are plain JSON so a user can read or keep them without the
// extension. The module only validates and shapes data; writing and reading
// files stays in the shell code.

export const BACKUP_APP = 'perdana-island';
export const BACKUP_FORMAT = 1;
export const MAX_BACKUP_CHARACTERS = 5 * 1024 * 1024;

// These describe the current machine or the current day: an inhibitor, a
// water/prayer notice that has already fired, a greeting that has been shown,
// and the daily agenda markers. They should not follow a user to another
// machine.
const LOCAL_ONLY_PREFERENCES = [
    'keepAwake',
    'lastWaterAt',
    'lastPrayerNotice',
    'lastAgendaBriefing',
    'lastAgendaRecap',
    'greetingWelcomeShown',
    'greetingLastSession',
];

export class BackupError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BackupError';
    }
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidDateKey(key) {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key))
        return false;
    const date = new Date(`${key}T00:00:00`);
    if (!Number.isFinite(date.getTime()))
        return false;
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` === key;
}

function cleanPreferences(value) {
    if (!isPlainObject(value))
        return {};
    const preferences = {};
    for (const [key, entry] of Object.entries(value)) {
        if (LOCAL_ONLY_PREFERENCES.includes(key))
            continue;
        if (entry === undefined || typeof entry === 'function')
            continue;
        preferences[key] = entry;
    }
    return preferences;
}

function cleanTasks(value) {
    if (!Array.isArray(value))
        return [];
    const tasks = [];
    for (const entry of value) {
        if (!isPlainObject(entry) || typeof entry.text !== 'string')
            continue;
        const text = entry.text.trim().slice(0, 120);
        if (!text)
            continue;
        tasks.push({
            id: typeof entry.id === 'string' && entry.id ? entry.id : `task-${tasks.length}`,
            text,
            done: entry.done === true,
            doneAt: typeof entry.doneAt === 'string' ? entry.doneAt : null,
            due: Number.isInteger(entry.due) && entry.due >= 0 && entry.due <= 1439 ? entry.due : null,
            dueDate: isValidDateKey(entry.dueDate) ? entry.dueDate : null,
            priority: ['high', 'medium', 'low'].includes(entry.priority) ? entry.priority : null,
        });
        if (tasks.length >= 5000)
            break;
    }
    return tasks;
}

function cleanNotes(value) {
    if (!Array.isArray(value))
        return [];
    const notes = [];
    for (const entry of value) {
        if (!isPlainObject(entry) || typeof entry.text !== 'string')
            continue;
        const text = entry.text.trim().slice(0, 4000);
        if (!text)
            continue;
        notes.push({
            id: typeof entry.id === 'string' && entry.id ? entry.id : `note-${notes.length}`,
            text,
            updatedAt: Number.isFinite(entry.updatedAt) ? entry.updatedAt : 0,
        });
        if (notes.length >= 5000)
            break;
    }
    return notes;
}

function cleanFocusLog(value) {
    if (!isPlainObject(value))
        return {};
    const log = {};
    let days = 0;
    for (const [key, entry] of Object.entries(value)) {
        const seconds = Number(entry);
        if (!isValidDateKey(key) || !Number.isFinite(seconds) || seconds <= 0)
            continue;
        log[key] = Math.round(seconds);
        if (++days >= 1000)
            break;
    }
    return log;
}

export function buildBackup(state, {version = '', now = new Date()} = {}) {
    const preferences = cleanPreferences(state?.preferences);
    const tasks = cleanTasks(state?.tasks);
    const notes = cleanNotes(state?.notes);
    const focusLog = cleanFocusLog(state?.focusLog);
    return {
        app: BACKUP_APP,
        format: BACKUP_FORMAT,
        createdAt: now.toISOString(),
        appVersion: String(version || ''),
        data: {preferences, tasks, notes, focusLog},
    };
}

export function parseBackup(text) {
    const source = typeof text === 'string' ? text : String(text ?? '');
    if (!source.trim())
        throw new BackupError('The file is empty');
    if (source.length > MAX_BACKUP_CHARACTERS)
        throw new BackupError('The file is too large to be a Perdana Island backup');

    let payload;
    try {
        payload = JSON.parse(source);
    } catch (_error) {
        throw new BackupError('The file is not valid JSON');
    }
    if (!isPlainObject(payload))
        throw new BackupError('This is not a Perdana Island backup');
    if (payload.app !== BACKUP_APP)
        throw new BackupError('This is not a Perdana Island backup');

    const format = Number(payload.format);
    if (!Number.isInteger(format) || format < 1)
        throw new BackupError('This backup has an unknown format');
    if (format > BACKUP_FORMAT) {
        throw new BackupError('This backup was made by a newer version of Perdana Island');
    }

    const data = isPlainObject(payload.data) ? payload.data : {};
    const preferences = cleanPreferences(data.preferences);
    const tasks = cleanTasks(data.tasks);
    const notes = cleanNotes(data.notes);
    const focusLog = cleanFocusLog(data.focusLog);
    if (!Object.keys(preferences).length && !tasks.length && !notes.length
        && !Object.keys(focusLog).length) {
        throw new BackupError('This backup has no island data');
    }

    return {
        preferences,
        tasks,
        notes,
        focusLog,
        createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : '',
        appVersion: typeof payload.appVersion === 'string' ? payload.appVersion : '',
        summary: {
            tasks: tasks.length,
            notes: notes.length,
            focusDays: Object.keys(focusLog).length,
            preferences: Object.keys(preferences).length,
        },
    };
}

export function backupFileName(now = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return `perdana-island-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

export function describeBackupSummary(summary) {
    if (!summary)
        return '';
    const parts = [];
    parts.push(`${summary.tasks} ${summary.tasks === 1 ? 'task' : 'tasks'}`);
    parts.push(`${summary.notes} ${summary.notes === 1 ? 'note' : 'notes'}`);
    if (summary.focusDays)
        parts.push(`${summary.focusDays} focus ${summary.focusDays === 1 ? 'day' : 'days'}`);
    if (summary.preferences)
        parts.push('settings');
    return parts.join(' · ');
}
