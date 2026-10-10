const PlatformSettings = require('../models/PlatformSettings');

const DEFAULTS = {
    siteName: 'SmartLease AI',
    contactEmail: '',
    sessionTimeoutMinutes: 300
};

// In-memory copy so synchronous code (token creation, email headers) can read
// settings without a database round trip. Refreshed on load and on every save.
let cache = { ...DEFAULTS };

const toPlain = (doc) => ({
    siteName: doc.siteName,
    contactEmail: doc.contactEmail,
    sessionTimeoutMinutes: doc.sessionTimeoutMinutes
});

const loadSettings = async () => {
    try {
        const doc = await PlatformSettings.findOne({ key: 'global' });
        cache = doc ? { ...DEFAULTS, ...toPlain(doc) } : { ...DEFAULTS };
    } catch (err) {
        console.error('Failed to load platform settings, using defaults:', err.message);
        cache = { ...DEFAULTS };
    }
    return cache;
};

const getSettings = () => ({ ...cache });

const updateSettings = async (changes) => {
    const doc = await PlatformSettings.findOneAndUpdate(
        { key: 'global' },
        { $set: changes, $setOnInsert: { key: 'global' } },
        { new: true, upsert: true, runValidators: true }
    );
    cache = { ...DEFAULTS, ...toPlain(doc) };
    return cache;
};

module.exports = { loadSettings, getSettings, updateSettings, DEFAULTS };
