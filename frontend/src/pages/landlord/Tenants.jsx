import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  X,
} from 'lucide-react';

import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';

const Tenants = () => {
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
        'Failed to fetch landlord tenants:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Failed to load tenants.'
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
    if (
      rental?.tenant &&
      typeof rental.tenant === 'object'
    ) {
      return rental.tenant;
    }

    return null;
  };

  const getProperty = (rental) => {
    if (
      rental?.property &&
      typeof rental.property === 'object'
    ) {
      return rental.property;
    }

    return null;
  };

  const getTenantId = (rental) => {
    const tenant = getTenant(rental);

    return tenant?._id || rental?.tenant;
  };

  const getTenantName = (rental) => {
    const tenant = getTenant(rental);

    return (
      tenant?.name ||
      rental?.tenantName ||
      'Unknown Tenant'
    );
  };

  const getTenantPhone = (rental) => {
    const tenant = getTenant(rental);

    return (
      tenant?.phone ||
      rental?.tenantPhone ||
      ''
    );
  };

  const getTenantEmail = (rental) => {
    const tenant = getTenant(rental);

    return (
      tenant?.email ||
      rental?.tenantEmail ||
      ''
    );
  };

  const getPropertyName = (rental) => {
    const property = getProperty(rental);

    return (
      property?.title ||
      rental?.propertyName ||
      'Unknown Property'
    );
  };

  const getRent = (rental) => {
    const property = getProperty(rental);

    return (
      rental?.monthlyRent ??
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
  // CREATE UNIQUE TENANT RECORDS
  // ============================================================

  const tenants = useMemo(() => {
    const tenantMap = new Map();

    rentals.forEach((rental) => {
      const tenantId = getTenantId(rental);

      if (!tenantId) {
        return;
      }

      const existing = tenantMap.get(
        tenantId.toString()
      );

      /*
       * Prefer an active rental if the tenant has
       * multiple rental records.
       */
      if (!existing) {
        tenantMap.set(
          tenantId.toString(),
          rental
        );
        return;
      }

      if (
        rental.status === 'active' &&
        existing.status !== 'active'
      ) {
        tenantMap.set(
          tenantId.toString(),
          rental
        );
      }
    });

    return Array.from(tenantMap.values());
  }, [rentals]);

  // ============================================================
  // FILTER TENANTS
  // ============================================================

  const filteredData = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return tenants.filter((rental) => {
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
  }, [
    tenants,
    searchTerm,
    statusFilter,
  ]);

  // ============================================================
  // TABLE
  // ============================================================

  const columns = [
    {
      header: 'Tenant Name',
      accessor: 'name',

      render: (row) => {
        const tenantName =
          getTenantName(row);

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lease-100 text-lease-700 flex items-center justify-center font-bold text-sm">
              {tenantName
                .charAt(0)
                .toUpperCase()}
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
      header: 'Start Date',
      accessor: 'start',

      render: (row) => (
        <span>
          {formatDate(row.startDate)}
        </span>
      ),
    },

    {
      header: 'Contractual Rent',
      accessor: 'rent',

      render: (row) => (
        <span className="font-medium">
          ₹
          {Number(
            getRent(row)
          ).toLocaleString('en-IN')}
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

      render: (row) => {
        const tenantId =
          getTenantId(row);

        const phone =
          getTenantPhone(row);

        const email =
          getTenantEmail(row);

        return (
          <div className="flex items-center gap-2">

            {/* VIEW */}
            {tenantId ? (
              <Link
                to={`/landlord/tenants/${tenantId}`}
                className="p-1 text-text-muted hover:text-lease-600 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </Link>
            ) : (
              <button
                disabled
                className="p-1 text-text-muted opacity-40 cursor-not-allowed"
                title="Tenant details unavailable"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            {/* CALL */}
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="p-1 text-text-muted hover:text-good-600 transition-colors"
                title="Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                className="p-1 text-text-muted opacity-40 cursor-not-allowed"
                title="Phone number unavailable"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}

            {/* EMAIL */}
            {email ? (
              <a
                href={`mailto:${email}`}
                className="p-1 text-text-muted hover:text-signal-600 transition-colors"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                className="p-1 text-text-muted opacity-40 cursor-not-allowed"
                title="Email unavailable"
              >
                <Mail className="w-4 h-4" />
              </button>
            )}

          </div>
        );
      },
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
            My Tenants
          </h1>

          <p className="text-text-muted mt-1">
            Manage all active and past tenants across your properties.
          </p>
        </div>
      </div>

      {/* TABLE CARD */}
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

          {/* FILTER BUTTON */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() =>
                setShowFilters((prev) => !prev)
              }
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
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

                <option value="active">
                  Active
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

                <option value="pending">
                  Pending
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
            Loading tenants...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
          />
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          tenants.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium text-ink">
                No tenants found
              </p>

              <p className="text-sm text-text-muted mt-1">
                Tenants associated with your properties will appear here.
              </p>
            </div>
          )}

        {/* NO SEARCH RESULTS */}
        {!loading &&
          !error &&
          tenants.length > 0 &&
          filteredData.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-medium text-ink">
                No matching tenants found
              </p>

              <p className="text-sm text-text-muted mt-1">
                Try changing your search or filters.
              </p>
            </div>
          )}

      </div>
    </div>
  );
};

export default Tenants;