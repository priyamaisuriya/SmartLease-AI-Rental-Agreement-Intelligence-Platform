const { getSettings, updateSettings } = require('../services/settingsService');
const { createActivityLog } = require('../services/activityLogService');

const withReadOnly = (settings) => ({
    ...settings,
    // Informational only: the AI model is chosen on the server (GEMINI_MODEL).
    aiModel: process.env.GEMINI_MODEL || 'gemini-3.7-flash'
});

const getPlatformSettings = async (req, res) => {
    return res.json(withReadOnly(getSettings()));
};

const updatePlatformSettings = async (req, res) => {
    try {
        const { siteName, contactEmail, sessionTimeoutMinutes } = req.body || {};
        const changes = {};

        if (siteName !== undefined) {
            if (typeof siteName !== 'string' || siteName.trim().length < 2 || siteName.trim().length > 60) {
                return res.status(400).json({ message: 'Site name must be 2 to 60 characters' });
            }
            changes.siteName = siteName.trim();
        }

        if (contactEmail !== undefined) {
            if (typeof contactEmail !== 'string' || !/^$|^\S+@\S+\.\S+$/.test(contactEmail.trim())) {
                return res.status(400).json({ message: 'Please provide a valid contact email' });
            }
            changes.contactEmail = contactEmail.trim().toLowerCase();
        }

        if (sessionTimeoutMinutes !== undefined) {
            const minutes = Number(sessionTimeoutMinutes);
            if (!Number.isInteger(minutes) || minutes < 15 || minutes > 1440) {
                return res.status(400).json({
                    message: 'Session timeout must be a whole number between 15 and 1440 minutes'
                });
            }
            changes.sessionTimeoutMinutes = minutes;
        }

        if (Object.keys(changes).length === 0) {
            return res.status(400).json({ message: 'No valid settings supplied' });
        }

        const before = getSettings();
        const saved = await updateSettings(changes);

        try {
            await createActivityLog({
                userId: req.user.id,
                action: 'SETTINGS_UPDATED',
                module: 'settings',
                description: 'Platform settings were updated',
                targetType: 'PlatformSettings',
                metadata: { before, after: saved },
                req,
                status: 'success'
            });
        } catch (e) {
            console.error('Activity log failed:', e.message);
        }

        return res.json({ message: 'Settings saved', ...withReadOnly(saved) });

    } catch (err) {
        console.error('Update settings error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPlatformSettings, updatePlatformSettings };
