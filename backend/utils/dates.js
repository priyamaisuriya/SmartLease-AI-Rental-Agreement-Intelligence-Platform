// Date helpers for rental ranges. Ranges are half-open: [start, end).
// Dates are handled as UTC midnight so server timezone never shifts a booking day.

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDateOnly = (value) => {
    if (typeof value !== 'string') return null;
    const m = DATE_ONLY.exec(value.trim());
    if (!m) return null;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (
        date.getUTCFullYear() !== y ||
        date.getUTCMonth() !== mo - 1 ||
        date.getUTCDate() !== d
    ) {
        return null;
    }
    return date;
};

const todayUtc = () => {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
};

// Whole calendar months between two dates, with a partial month counted as a fraction.
const monthsBetween = (start, end) => (end - start) / (1000 * 60 * 60 * 24 * 30.44);

// Mongo filter for ranges overlapping [start, end)
const overlapFilter = (start, end) => ({
    startDate: { $lt: end },
    endDate: { $gt: start }
});

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { parseDateOnly, todayUtc, monthsBetween, overlapFilter, escapeRegex };
