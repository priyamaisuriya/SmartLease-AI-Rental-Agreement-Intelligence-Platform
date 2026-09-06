import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, X } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const RentalRequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestToView, setRequestToView] = useState(null);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/rentals');

      const formattedRentals = res.data.rentals.map(rental => ({
        id: rental._id,
        tenant: rental.tenant?.name || 'Unknown',
        tenantEmail: rental.tenant?.email || 'N/A',
        tenantPhone: rental.tenant?.phone || 'N/A',
        property: rental.property?.title || 'Unknown Property',
        propertyAddress: `${rental.property?.city || ''}, ${rental.property?.state || ''}`.replace(/^, | ,$/g, ''),
        landlord: rental.landlord?.name || 'Unknown',
        landlordEmail: rental.landlord?.email || 'N/A',
        rent: rental.rentAmount || rental.property?.monthlyRent || 0,
        date: new Date(rental.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: rental.status ? rental.status.charAt(0).toUpperCase() + rental.status.slice(1) : 'Unknown',
      }));

      setRentals(formattedRentals);
    } catch (err) {
      console.error('Failed to fetch rentals:', err);
      setError('Failed to load rental requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const filteredData = rentals.filter(item =>
    item.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.landlord.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Tenant', accessor: 'tenant', render: (row) => <span className="font-medium text-ink">{row.tenant}</span> },
    { header: 'Property', accessor: 'property' },
    { header: 'Landlord', accessor: 'landlord' },
    {
      header: 'Listed Rent',
      accessor: 'rent',
      render: (row) => <span>₹{row.rent.toLocaleString()}</span>
    },
    { header: 'Request Date', accessor: 'date' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRequestToView(row)}
            className="p-1 text-text-muted hover:text-lease-600 transition-colors"
            title="View Request Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading && rentals.length === 0) {
    return <div className="p-8 text-center text-text-muted fade-in">Loading rental requests...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-risk-red fade-in">{error}</div>;
  }

  return (
    <div className="space-y-6 fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Rental Requests</h1>
          <p className="text-text-muted mt-1">Manage and track all tenant rental applications.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tenant, landlord, or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredData} />

        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-paper/30">
          <div>Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of {filteredData.length} results</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-border disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-border disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* View Request Modal */}
      {requestToView && (
        <div className="fixed inset-0 z-50 bg-lease-800/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-border w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-ink text-lg">Rental Request Details</h3>
              <button onClick={() => setRequestToView(null)} className="text-text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display font-semibold text-ink text-lg">{requestToView.property}</h4>
                  <p className="text-sm text-text-muted">{requestToView.propertyAddress || 'Location not specified'}</p>
                </div>
                <StatusBadge status={requestToView.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-text-muted">Rent Amount</p>
                  <p className="font-medium text-ink">₹{requestToView.rent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Request Date</p>
                  <p className="font-medium text-ink">{requestToView.date}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <h5 className="font-semibold text-ink text-sm mb-3">Tenant Information</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted">Name</p>
                    <p className="font-medium text-ink">{requestToView.tenant}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Contact</p>
                    <p className="font-medium text-ink truncate" title={requestToView.tenantEmail}>{requestToView.tenantEmail}</p>
                    <p className="text-xs text-text-muted mt-0.5">{requestToView.tenantPhone}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <h5 className="font-semibold text-ink text-sm mb-3">Landlord Information</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted">Name</p>
                    <p className="font-medium text-ink">{requestToView.landlord}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Contact</p>
                    <p className="font-medium text-ink truncate" title={requestToView.landlordEmail}>{requestToView.landlordEmail}</p>
                  </div>
                </div>
              </div>

            </div>
            <div className="p-5 border-t border-border flex justify-end">
              <button
                onClick={() => setRequestToView(null)}
                className="px-4 py-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalRequestsManagement;
