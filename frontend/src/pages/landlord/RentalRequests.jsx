import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const RentalRequests = () => {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ============================================================
  // FETCH LANDLORD RENTALS
  // ============================================================

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/rentals/my-properties');

      const data =
        response.data.rentals ||
        response.data ||
        [];

      setRentals(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error(
        'Failed to fetch landlord rental requests:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load rental requests.'
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const getTenant = (rental) => {
    if (!rental?.tenant) {
      return null;
    }

    if (typeof rental.tenant === 'object') {
      return rental.tenant;
    }

    return null;
  };

  const getProperty = (rental) => {
    if (!rental?.property) {
      return null;
    }

    if (typeof rental.property === 'object') {
      return rental.property;
    }

    return null;
  };

  const getTenantName = (rental) => {
    const tenant = getTenant(rental);

    return (
      tenant?.name ||
      rental.tenantName ||
      'Unknown Tenant'
    );
  };

  const getPropertyName = (rental) => {
    const property = getProperty(rental);

    return (
      property?.title ||
      rental.propertyName ||
      'Unknown Property'
    );
  };

  const getRent = (rental) => {
    const property = getProperty(rental);

    return (
      rental.monthlyRent ??
      property?.monthlyRent ??
      0
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return 'Unknown';
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  // ============================================================
  // FILTER DATA
  // ============================================================

  const filteredData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return rentals.filter((rental) => {
      const tenantName =
        getTenantName(rental).toLowerCase();

      const propertyName =
        getPropertyName(rental).toLowerCase();

      const matchesSearch =
        !search ||
        tenantName.includes(search) ||
        propertyName.includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        rental.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rentals, searchTerm, statusFilter]);

  // ============================================================
  // VIEW TENANT
  // ============================================================

  const handleView = (rental) => {
    const tenant = getTenant(rental);

    if (tenant?._id) {
      navigate(`/landlord/tenants/${tenant._id}`);
      return;
    }

    // If tenant details are not populated,
    // simply do nothing rather than navigating to an invalid URL.
  };

  // ============================================================
  // TABLE
  // ============================================================

  const columns = [
    {
      header: 'Tenant Name',
      accessor: 'tenant',

      render: (row) => {
        const tenantName = getTenantName(row);

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lease-100 text-lease-700 flex items-center justify-center font-bold text-sm">
              {tenantName.charAt(0).toUpperCase()}
            </div>

            <span className="font-medium text-ink">
              {tenantName}
            </span>
          </div>
        );
      },
    },

    {
      header: 'Property',
      accessor: 'property',

      render: (row) => (
        <span className="text-ink">
          {getPropertyName(row)}
        </span>
      ),
    },

    {
      header: 'Listed Rent',
      accessor: 'rent',

      render: (row) => (
        <span className="font-medium">
          ₹{Number(getRent(row)).toLocaleString('en-IN')}
        </span>
      ),
    },

    {
      header: 'Request Date',
      accessor: 'date',

      render: (row) => (
        <span>
          {formatDate(
            row.bookingDate ||
            row.createdAt
          )}
        </span>
      ),
    },

    {
      header: 'Status',
      accessor: 'status',

      render: (row) => (
        <StatusBadge
          status={formatStatus(row.status)}
        />
      ),
    },

    {
      header: 'Actions',
      accessor: 'actions',

      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            disabled={!getTenant(row)?._id}
            className="p-1 text-text-muted hover:text-lease-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="View Tenant Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6 fade-in pb-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Rental Requests
          </h1>

          <p className="text-text-muted mt-1">
            Review tenant rental activity for your properties.
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* TOOLBAR */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* SEARCH */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Search by tenant or property..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-2 w-full sm:w-auto">

            <button
              onClick={() =>
                setShowFilters((prev) => !prev)
              }
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
            >
              <Filter className="w-4 h-4" />

              <span>
                Filters
              </span>
            </button>

          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="p-4 border-b border-border bg-paper">

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">

              <label className="text-sm font-medium text-ink">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="active">
                  Active
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
                Clear
              </button>

            </div>

          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="p-10 text-center text-text-muted">
            Loading rental requests...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
          />
        )}

        {/* EMPTY SEARCH RESULT */}
        {!loading &&
          !error &&
          rentals.length > 0 &&
          filteredData.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium text-ink">
                No matching rental records found.
              </p>

              <p className="text-sm text-text-muted mt-1">
                Try changing your search or filters.
              </p>
            </div>
          )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          rentals.length === 0 && (
            <div className="p-10 text-center">

              <p className="font-medium text-ink">
                No rental requests yet
              </p>

              <p className="text-sm text-text-muted mt-1">
                Tenant bookings for your properties will appear here.
              </p>

            </div>
          )}

      </div>
    </div>
  );
};

export default RentalRequests;