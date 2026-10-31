// SPDX-License-Identifier: GPL-3.0-or-later

// Natural-language parsing for the quick capture field. The parser only reads
// the typed text and returns a plain object, so the shell code can preview the
// result before anything is saved.

const DAY_WORDS = {
    senin: 1, monday: 1,
    selasa: 2, tuesday: 2,
    rabu: 3, wednesday: 3,
    kamis: 4, thursday: 4,
    jumat: 5, "jum'at": 5, friday: 5,
    sabtu: 6, saturday: 6,
    minggu: 0, ahad: 0, sunday: 0,
};

const MONTH_WORDS = {
    jan: 0, januari: 0, january: 0,
    feb: 1, februari: 1, february: 1,
    mar: 2, maret: 2, march: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5, june: 5,
    jul: 6, juli: 6, july: 6,
    agu: 7, agustus: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, december: 11,
};

const PERIOD_DEFAULT_MINUTES = {
    pagi: 8 * 60, morning: 8 * 60,
    siang: 12 * 60, afternoon: 13 * 60,
    sore: 16 * 60, evening: 18 * 60,
    malam: 19 * 60, night: 19 * 60,
};

const ENGLISH_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ENGLISH_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(value) {
    return String(value).padStart(2, '0');
}

function dateKeyFor(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDays(date, days) {
    const shifted = startOfDay(date);
    shifted.setDate(shifted.getDate() + days);
    return shifted;
}

function resolveHour(hour, period, suffix) {
    if (!Number.isInteger(hour) || hour > 23)
        return null;
    if (suffix === 'pm' && hour < 12)
        return hour + 12;
    if (suffix === 'am' && hour === 12)
        return 0;
    if (suffix)
        return hour;
    if (!period)
        return hour;
    if (period === 'pagi' || period === 'morning')
        return hour === 12 ? 0 : hour;
    if (period === 'malam' || period === 'night')
        return hour === 12 ? 0 : (hour < 12 ? hour + 12 : hour);
    return hour === 12 ? 12 : (hour < 12 ? hour + 12 : hour);
}

// The date label only says "Today" or "Tomorrow" when the day is close. Later
// dates use the weekday name instead of a full date to keep the preview short.
function relativeDayLabel(dateKey, now) {
    const target = startOfDay(new Date(`${dateKey}T00:00:00`));
    const today = startOfDay(now);
    const days = Math.round((target - today) / 86400000);
    if (days === 0)
        return 'Today';
    if (days === 1)
        return 'Tomorrow';
    if (days > 1 && days < 7)
        return ENGLISH_WEEKDAYS[target.getDay()];
    return `${target.getDate()} ${ENGLISH_MONTHS[target.getMonth()]}`;
}

export function formatCaptureTime(minutes) {
    if (!Number.isInteger(minutes))
        return '';
    const value = Math.max(0, Math.min(1439, minutes));
    return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
}

export function formatCaptureSchedule(result, now = new Date()) {
    if (!result)
        return '';
    const parts = [];
    if (result.dueDate)
        parts.push(relativeDayLabel(result.dueDate, now));
    if (Number.isInteger(result.due))
        parts.push(formatCaptureTime(result.due));
    return parts.join(' · ');
}

export function parseQuickCapture(input, now = new Date()) {
    const raw = String(input ?? '').replace(/\s+/g, ' ').trim();
    const result = {
        raw,
        text: raw,
        type: 'task',
        due: null,
        dueDate: null,
        priority: null,
        hasDate: false,
        hasTime: false,
        tokens: [],
    };
    if (!raw)
        return result;

    let work = raw;
    const take = pattern => {
        const match = work.match(pattern);
        if (!match)
            return null;
        work = work.replace(pattern, ' ');
        result.tokens.push(match[0].trim());
        return match;
    };

    let dayOffset = null;
    const relative = take(/\b(?:hari ini|besok|esok|lusa|today|tomorrow|tonight)\b/i);
    if (relative) {
        const word = relative[0].toLowerCase();
        if (word === 'lusa')
            dayOffset = 2;
        else if (word === 'besok' || word === 'esok' || word === 'tomorrow')
            dayOffset = 1;
        else
            dayOffset = 0;
        result.hasDate = true;
    }

    let weekday = null;
    if (dayOffset === null) {
        const weekdayMatch = take(/\b(?:senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu|ahad|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
        if (weekdayMatch) {
            const word = weekdayMatch[0].toLowerCase();
            if (Object.hasOwn(DAY_WORDS, word)) {
                weekday = DAY_WORDS[word];
                result.hasDate = true;
            }
        }
    }

    // "5 November" or "5 Nov" is less common than relative words, but it is
    // unambiguous enough to accept.
    let monthDay = null;
    if (dayOffset === null && weekday === null) {
        const monthDayMatch = take(/\b(\d{1,2})\s+(januari|january|jan|februari|february|feb|maret|march|mar|april|apr|mei|may|juni|june|jun|juli|july|jul|agustus|august|agu|september|sep|oktober|october|okt|november|nov|desember|december|des)\b/i);
        if (monthDayMatch) {
            const day = Number(monthDayMatch[1]);
            const month = MONTH_WORDS[monthDayMatch[2].toLowerCase()];
            if (Object.hasOwn(MONTH_WORDS, monthDayMatch[2].toLowerCase()) && day >= 1 && day <= 31) {
                monthDay = {day, month};
                result.hasDate = true;
            }
        }
    }

    let period = null;
    const periodMatch = take(/\b(?:pagi|siang|sore|malam|morning|afternoon|evening|night)\b/i);
    if (periodMatch) {
        const word = periodMatch[0].toLowerCase();
        if (Object.hasOwn(PERIOD_DEFAULT_MINUTES, word))
            period = word;
    }

    let hour = null;
    let minute = 0;
    let suffix = null;
    const clockPatterns = [
        [/\b(?:jam|pukul)\s*(\d{1,2})(?:[:.](\d{1,2}))?\b/i, false],
        [/\b(?:at|pada)\s+(\d{1,2})(?:[:.](\d{1,2}))?\s*(am|pm)\b/i, true],
        [/\b(\d{1,2})(?:[:.](\d{1,2}))?\s*(am|pm)\b/i, true],
        [/\b(\d{1,2})[:.](\d{1,2})\b/, false],
        [/\b(?:at|pada)\s*(\d{1,2})(?:[:.](\d{1,2}))?\b/i, false],
    ];
    for (const [pattern, hasSuffix] of clockPatterns) {
        const match = take(pattern);
        if (!match)
            continue;
        hour = Number(match[1]);
        minute = match[2] === undefined ? 0 : Number(match[2]);
        if (!Number.isInteger(minute) || minute > 59)
            minute = 0;
        if (hasSuffix && match[3])
            suffix = match[3].toLowerCase();
        break;
    }

    let due = null;
    if (hour !== null) {
        const resolved = resolveHour(hour, period, suffix);
        if (resolved !== null) {
            due = resolved * 60 + minute;
            result.hasTime = true;
        }
    } else if (period) {
        due = PERIOD_DEFAULT_MINUTES[period];
        result.hasTime = true;
    }

    let dueDate = null;
    const today = startOfDay(now);
    if (dayOffset !== null) {
        dueDate = dateKeyFor(shiftDays(today, dayOffset));
    } else if (weekday !== null) {
        const delta = (weekday - today.getDay() + 7) % 7;
        dueDate = dateKeyFor(shiftDays(today, delta));
    } else if (monthDay) {
        const candidate = new Date(now.getFullYear(), monthDay.month, monthDay.day);
        if (candidate < today)
            candidate.setFullYear(candidate.getFullYear() + 1);
        dueDate = dateKeyFor(candidate);
    } else if (result.hasTime) {
        // A bare clock time means the next occurrence: "jam 9" typed at 10:00
        // becomes tomorrow 09:00 instead of a task that is already late.
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        dueDate = dateKeyFor(due <= nowMinutes ? shiftDays(today, 1) : today);
    }

    if (dueDate && !result.hasTime) {
        due = null;
    }

    let priority = null;
    const priorityPatterns = [
        [/\s*!(?:high|tinggi|penting|urgent)\b/i, 'high'],
        [/\s*!(?:low|rendah)\b/i, 'low'],
        [/^\s*(?:penting|urgent|mendesak)\s*[:,-]?\s*/i, 'high'],
        [/\s+(?:penting|urgent|mendesak)\s*$/i, 'high'],
        [/\s+(?:rendah|santai)\s*$/i, 'low'],
        [/\s+(?:high priority|top priority)\s*$/i, 'high'],
        [/\s+(?:low priority)\s*$/i, 'low'],
    ];
    for (const [pattern, value] of priorityPatterns) {
        const match = work.match(pattern);
        if (!match)
            continue;
        work = work.replace(pattern, ' ');
        priority = value;
        result.tokens.push(match[0].trim());
        break;
    }

    let text = work
        .replace(/\s+/g, ' ')
        .replace(/\s+([,.;:!?])/g, '$1')
        .replace(/^[,.;:\-–\s]+|[,.;:\-–\s]+$/g, '')
        .trim();
    if (!text)
        text = raw;

    result.text = text;
    result.priority = priority;
    result.due = due;
    result.dueDate = dueDate;
    return result;
}

export function describeCapture(result, now = new Date()) {
    const schedule = formatCaptureSchedule(result, now);
    const priority = result?.priority
        ? result.priority[0].toUpperCase() + result.priority.slice(1)
        : '';
    return [schedule, priority].filter(Boolean).join(' · ');
}
