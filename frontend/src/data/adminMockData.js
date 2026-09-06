// src/data/adminMockData.js

export const adminStats = {
  totalUsers: { value: '12,450', trend: '+12.5%', isPositive: true },
  totalProperties: { value: '3,240', trend: '+5.2%', isPositive: true },
  rentalRequests: { value: '8,920', trend: '+8.1%', isPositive: true },
  agreementsAnalyzed: { value: '5,680', trend: '+15.3%', isPositive: true },
  aiAnalyses: { value: '7,850', trend: '+22.4%', isPositive: true },
  activeRentals: { value: '2,140', trend: '+3.7%', isPositive: true },
};

export const userGrowthData = [
  { name: 'Mon', newUsers: 150, activeUsers: 4500 },
  { name: 'Tue', newUsers: 230, activeUsers: 4800 },
  { name: 'Wed', newUsers: 180, activeUsers: 5100 },
  { name: 'Thu', newUsers: 290, activeUsers: 5400 },
  { name: 'Fri', newUsers: 200, activeUsers: 5600 },
  { name: 'Sat', newUsers: 340, activeUsers: 6200 },
  { name: 'Sun', newUsers: 310, activeUsers: 6400 },
];

export const propertyStatsData = [
  { name: 'Available', value: 1200, fill: '#5B57E8' },
  { name: 'Rented', value: 1600, fill: '#3B9457' },
  { name: 'Pending', value: 340, fill: '#C1811F' },
  { name: 'Inactive', value: 100, fill: '#8A8FA3' },
];

export const rentalRequestStatsData = [
  { name: 'Pending', value: 2400, fill: '#C1811F' },
  { name: 'Accepted', value: 4500, fill: '#3B9457' },
  { name: 'Rejected', value: 1500, fill: '#C24343' },
  { name: 'Cancelled', value: 520, fill: '#8A8FA3' },
];

export const agreementRiskData = [
  { name: 'Low Risk', value: 3500, fill: '#3B9457' },
  { name: 'Medium Risk', value: 1500, fill: '#C1811F' },
  { name: 'High Risk', value: 680, fill: '#C24343' },
];

export const aiUsageTimeData = [
  { name: 'Week 1', totalRequests: 1200, processingTime: 1.2 },
  { name: 'Week 2', totalRequests: 1500, processingTime: 1.1 },
  { name: 'Week 3', totalRequests: 1800, processingTime: 1.3 },
  { name: 'Week 4', totalRequests: 2400, processingTime: 1.0 },
];

export const recentActivity = [
  { id: 1, type: 'user', desc: 'New user registered', user: 'Rahul Verma', time: '10 mins ago' },
  { id: 2, type: 'property', desc: 'New property added', user: 'Meera Shah', time: '25 mins ago' },
  { id: 3, type: 'request', desc: 'Rental request accepted', user: 'Kunal Desai', time: '1 hour ago' },
  { id: 4, type: 'ai', desc: 'AI analysis completed', user: 'Ananya Rao', time: '2 hours ago' },
  { id: 5, type: 'report', desc: 'Risk report generated', user: 'System', time: '3 hours ago' },
];

export const usersData = [
  { id: 'u1', name: 'Ananya Rao', email: 'ananya.r@example.com', role: 'Tenant', properties: 0, agreements: 3, status: 'Active', joined: '12 Jan 2026' },
  { id: 'u2', name: 'Meera Shah', email: 'meera.shah@example.com', role: 'Landlord', properties: 5, agreements: 12, status: 'Active', joined: '05 Mar 2025' },
  { id: 'u3', name: 'Rakesh Patel', email: 'rakesh.p@example.com', role: 'Property Manager', properties: 18, agreements: 45, status: 'Active', joined: '22 Nov 2024' },
  { id: 'u4', name: 'Admin User', email: 'admin@smartlease.ai', role: 'Admin', properties: 0, agreements: 0, status: 'Active', joined: '01 Jan 2024' },
  { id: 'u5', name: 'Sanjay Mehta', email: 'sanjay.m@example.com', role: 'Landlord', properties: 2, agreements: 2, status: 'Inactive', joined: '15 Aug 2025' },
];

export const adminPropertiesData = [
  { id: 'p1', title: 'Willow Creek Residency', location: 'Vesu, Surat', owner: 'Rakesh Patel', rent: 18500, type: 'Apartment', status: 'Available', created: '10 Aug 2026' },
  { id: 'p2', title: 'Palm Grove Apartments', location: 'Adajan, Surat', owner: 'Kunal Desai', rent: 14000, type: 'Apartment', status: 'Available', created: '15 Aug 2026' },
  { id: 'p3', title: 'Cedar Heights', location: 'Pal, Surat', owner: 'Meera Shah', rent: 26000, type: 'Villa', status: 'Rented', created: '01 Sep 2026' },
  { id: 'p4', title: 'Riverside Elm', location: 'Athwa, Surat', owner: 'Nisha Kapoor', rent: 21000, type: 'Apartment', status: 'Pending', created: '05 Sep 2026' },
];

export const adminRentalRequestsData = [
  { id: 'r1', tenant: 'Rahul Verma', property: 'Willow Creek Residency', landlord: 'Rakesh Patel', rent: 18500, date: '28 Aug 2026', status: 'Pending' },
  { id: 'r2', tenant: 'Ananya Rao', property: 'Cedar Heights', landlord: 'Meera Shah', rent: 26000, date: '20 Aug 2026', status: 'Accepted' },
  { id: 'r3', tenant: 'Vikram Singh', property: 'Palm Grove Apartments', landlord: 'Kunal Desai', rent: 14000, date: '12 Aug 2026', status: 'Rejected' },
];

export const adminAgreementsData = [
  { id: 'a1', agreement: 'Cedar Heights - Lease.pdf', tenant: 'Ananya Rao', landlord: 'Meera Shah', property: 'Cedar Heights', date: '02 Sep 2026', analysis: 'Completed', risk: 'Medium' },
  { id: 'a2', agreement: 'Independent Upload.pdf', tenant: 'Unknown', landlord: 'Unknown', property: 'Not Linked', date: '14 Jun 2026', analysis: 'Completed', risk: 'High' },
  { id: 'a3', agreement: 'Draft Agreement 2BHK.docx', tenant: 'Rahul Verma', landlord: 'Rakesh Patel', property: 'Willow Creek Residency', date: '29 Aug 2026', analysis: 'Processing', risk: null },
];

export const adminReportsData = [
  { id: 'rep1', name: 'Platform Risk Overview', agreement: 'All Properties', by: 'System', date: '01 Sep 2026', type: 'Risk Report', status: 'Generated' },
  { id: 'rep2', name: 'Cedar Heights Analysis', agreement: 'Cedar Heights - Lease.pdf', by: 'Ananya Rao', date: '02 Sep 2026', type: 'Complete Analysis', status: 'Generated' },
];

export const feedbackData = [
  { id: 'f1', user: 'Ananya Rao', rating: 5, category: 'Agreement Analysis', feedback: 'The AI highlighted exactly the clause I was worried about!', date: '03 Sep 2026', status: 'New' },
  { id: 'f2', user: 'Meera Shah', rating: 4, category: 'UI/UX', feedback: 'Dashboard looks great, would love to see rent trends.', date: '01 Sep 2026', status: 'Reviewed' },
  { id: 'f3', user: 'Rakesh Patel', rating: 2, category: 'Property Search', feedback: 'Filters are a bit slow on mobile devices.', date: '28 Aug 2026', status: 'New' },
];

export const auditLogsData = [
  { id: 'al1', user: 'Admin User', action: 'Update Status', module: 'Users', desc: 'Suspended user account U-8821', time: '06 Sep 2026 10:15 AM', status: 'Success' },
  { id: 'al2', user: 'System', action: 'Report Gen', module: 'Reports', desc: 'Generated Weekly Risk Overview', time: '06 Sep 2026 09:00 AM', status: 'Success' },
  { id: 'al3', user: 'Meera Shah', action: 'Property Add', module: 'Properties', desc: 'Added Cedar Heights Listing', time: '05 Sep 2026 14:30 PM', status: 'Success' },
];
