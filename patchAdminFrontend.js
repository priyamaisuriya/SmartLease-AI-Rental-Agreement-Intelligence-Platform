const fs = require('fs');
const path = require('path');

const adminDashboardPath = path.join(__dirname, 'frontend/src/pages/admin/AdminDashboard.jsx');
let content = fs.readFileSync(adminDashboardPath, 'utf8');

// Remove import { recentActivity as mockRecentActivity }
content = content.replace("import { recentActivity as mockRecentActivity } from '../../data/adminMockData';\n", "");

// Update kpis to use actual revenue
content = content.replace("monthlyRevenue: '1,24,000', // Static placeholder", "monthlyRevenue: dashboardData?.monthlyRevenue?.toLocaleString('en-IN') || '0',");

// Update platformAlerts and recentActivity to use dashboardData
content = content.replace(
    "  const platformAlerts = [\n    { id: 1, type: 'High Risk Agreement', message: 'Cedar Heights - Lease.pdf flagged with 4 high-risk clauses.', severity: 'high' },\n    { id: 2, type: 'System Performance', message: 'AI processing time increased by 1.2s average.', severity: 'medium' },\n    { id: 3, type: 'Server Update', message: 'Scheduled maintenance completed successfully.', severity: 'low' },\n  ];\n\n  const recentActivity = mockRecentActivity;",
    "  const platformAlerts = dashboardData?.platformAlerts || [];\n  const recentActivity = dashboardData?.recentActivity || [];"
);

fs.writeFileSync(adminDashboardPath, content);
console.log("Updated AdminDashboard.jsx");
