export const landlordStats = {
  totalProperties: { value: 24, trend: '+2', isPositive: true },
  availableProperties: { value: 8, trend: '-1', isPositive: false },
  rentedProperties: { value: 14, trend: '+3', isPositive: true },
  pendingRequests: { value: 5, trend: '+5', isPositive: true },
  activeTenants: { value: 16, trend: '+2', isPositive: true },
  agreements: { value: 18, trend: '+4', isPositive: true },
};

export const myPropertiesData = [
  { id: '1', title: 'Sunset Apartments 4B', location: 'Koramangala, Bangalore', rent: 45000, bhk: '2 BHK', tenant: 'Rahul Sharma', status: 'Rented' },
  { id: '2', title: 'Green Valley Villa', location: 'Indiranagar, Bangalore', rent: 85000, bhk: '4 BHK', tenant: 'None', status: 'Available' },
  { id: '3', title: 'Tech Park Studio', location: 'Whitefield, Bangalore', rent: 22000, bhk: '1 RK', tenant: 'None', status: 'Pending' },
  { id: '4', title: 'Lakeview Residency', location: 'HSR Layout, Bangalore', rent: 35000, bhk: '2 BHK', tenant: 'Priya Patel', status: 'Rented' },
];

export const landlordRentalRequests = [
  { id: 'r1', tenant: 'Arjun Kumar', property: 'Tech Park Studio', rent: 22000, date: 'Oct 24, 2026', status: 'Pending' },
  { id: 'r2', tenant: 'Neha Gupta', property: 'Green Valley Villa', rent: 85000, date: 'Oct 22, 2026', status: 'Accepted' },
  { id: 'r3', tenant: 'Vikram Singh', property: 'Sunset Apartments 4B', rent: 42000, date: 'Oct 15, 2026', status: 'Rejected' },
];

export const landlordTenants = [
  { id: 't1', name: 'Rahul Sharma', property: 'Sunset Apartments 4B', start: 'Jan 1, 2026', rent: 42000, status: 'Active' },
  { id: 't2', name: 'Priya Patel', property: 'Lakeview Residency', start: 'Mar 15, 2026', rent: 35000, status: 'Active' },
  { id: 't3', name: 'Anita Desai', property: 'Oakwood Heights', start: 'Nov 1, 2025', rent: 60000, status: 'Ending Soon' },
];

export const landlordReminders = [
  { id: 'rem1', title: 'Agreement Expiry', property: 'Oakwood Heights', date: 'Oct 31, 2026', type: 'Agreement' },
  { id: 'rem2', title: 'Rent Overdue', property: 'Sunset Apartments 4B', date: 'Oct 5, 2026', type: 'Rent' },
  { id: 'rem3', title: 'Annual Maintenance', property: 'Lakeview Residency', date: 'Nov 15, 2026', type: 'Inspection' },
];

export const landlordChartData = [
  { name: 'Jan', rented: 10, available: 5 },
  { name: 'Feb', rented: 11, available: 4 },
  { name: 'Mar', rented: 12, available: 4 },
  { name: 'Apr', rented: 12, available: 5 },
  { name: 'May', rented: 13, available: 3 },
  { name: 'Jun', rented: 14, available: 2 },
];
