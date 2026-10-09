const Notification = require('../models/Notification');

/**
 * Creates a notification in the database.
 * Prevents duplicates by checking if a similar notification exists recently (e.g. within 1 hour).
 */
const createNotification = async (data) => {
    try {
        const { user, title, message, type, link, relatedEntityModel, relatedEntityId } = data;

        // Check for duplicates within the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const existing = await Notification.findOne({
            user,
            relatedEntityId,
            title,
            createdAt: { $gte: oneHourAgo }
        });

        if (existing) {
            return existing; // Skip duplicate
        }

        const notification = new Notification({
            user,
            title,
            message,
            type: type || 'system',
            link,
            relatedEntityModel,
            relatedEntityId
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        // We don't want notification failure to break the main flow
    }
};

module.exports = {
    createNotification
};
