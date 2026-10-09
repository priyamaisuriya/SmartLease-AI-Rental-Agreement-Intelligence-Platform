const fs = require('fs');
const path = require('path');

const adminDashboardPath = path.join(__dirname, 'backend/controllers/adminDashboardController.js');

let content = fs.readFileSync(adminDashboardPath, 'utf8');

if (!content.includes('const ActivityLog = require')) {
    content = content.replace("const RentReminder = require('../models/RentReminder');", "const RentReminder = require('../models/RentReminder');\nconst Payment = require('../models/Payment');\nconst ActivityLog = require('../models/ActivityLog');\nconst Notification = require('../models/Notification');");
}

if (!content.includes('revenueResult')) {
    content = content.replace(
        "    ]);\n\n    return res.json({",
        "    ]);\n\n    const revenueResult = await Payment.aggregate([\n      { $match: { paymentStatus: 'paid' } },\n      { $group: { _id: null, total: { $sum: '$amount' } } }\n    ]);\n    const monthlyRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;\n\n    const recentActivity = await ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email role');\n\n    const platformAlerts = await Notification.find({ type: 'system' }).sort({ createdAt: -1 }).limit(5);\n\n    return res.json({"
    );
}

if (!content.includes('monthlyRevenue')) {
    content = content.replace(
        "      users: {",
        "      monthlyRevenue,\n      recentActivity: recentActivity.map(a => ({\n        id: a._id,\n        user: a.user ? a.user.name : 'System',\n        desc: a.description || a.action,\n        time: a.createdAt\n      })),\n      platformAlerts: platformAlerts.map(a => ({\n        id: a._id,\n        type: a.title,\n        message: a.message,\n        severity: 'medium'\n      })),\n      users: {"
    );
}

fs.writeFileSync(adminDashboardPath, content);
console.log("Updated adminDashboardController");
