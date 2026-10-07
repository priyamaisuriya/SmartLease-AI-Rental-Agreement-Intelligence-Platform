import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Search,
  Filter,
  Eye,
  X,
  CheckCircle,
  Ban,
  RefreshCw,
  Loader2
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import api from '../../services/api';


// ============================================================
// RENTAL REQUESTS
// ============================================================

const RentalRequests = () => {

  const navigate = useNavigate();


  // ==========================================================
  // STATES
  // ==========================================================

  const [rentals, setRentals] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [showFilters, setShowFilters] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');



  // ==========================================================
  // FETCH LANDLORD RENTAL REQUESTS
  // ==========================================================

  const fetchRentals = async () => {

    try {

      setLoading(true);

      setError('');

      const response =
        await api.get(
          '/rentals/my-properties'
        );


      const data =
        response.data?.rentals ||
        response.data ||
        [];


      setRentals(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (err) {

      console.error(
        'Failed to fetch landlord rental requests:',
        err.response?.data ||
        err.message
      );


      setError(
        err.response?.data?.message ||
        'Failed to load rental requests.'
      );


    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // LOAD REQUESTS
  // ==========================================================

  useEffect(() => {

    fetchRentals();

  }, []);



  // ==========================================================
  // ACCEPT / REJECT REQUEST
  // ==========================================================

  const handleUpdateStatus = async (
    rental,
    newStatus
  ) => {

    if (!rental?._id) {

      setError(
        'Invalid rental request.'
      );

      return;
    }


    // --------------------------------------------------------
    // ONLY PENDING REQUEST CAN BE UPDATED
    // --------------------------------------------------------

    if (rental.status !== 'pending') {

      setError(
        'Only pending requests can be accepted or rejected.'
      );

      return;
    }


    // --------------------------------------------------------
    // CONFIRM ACTION
    // --------------------------------------------------------

    const actionText =
      newStatus === 'accepted'
        ? 'accept this rental request'
        : 'reject this rental request';


    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionText}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setActionLoading(
        rental._id
      );

      setError('');

      setSuccess('');


      // ------------------------------------------------------
      // UPDATE BACKEND
      // ------------------------------------------------------

      const response =
        await api.patch(
          `/rentals/${rental._id}/status`,
          {
            status: newStatus
          }
        );


      // ------------------------------------------------------
      // SUCCESS MESSAGE
      // ------------------------------------------------------

      setSuccess(
        response.data?.message ||
        (
          newStatus === 'accepted'
            ? 'Rental request accepted successfully.'
            : 'Rental request rejected successfully.'
        )
      );


      // ------------------------------------------------------
      // REFRESH LIST
      // ------------------------------------------------------

      await fetchRentals();


    } catch (err) {

      console.error(
        'Failed to update rental status:',
        err.response?.data ||
        err.message
      );


      setError(
        err.response?.data?.message ||
        'Failed to update rental request.'
      );


    } finally {

      setActionLoading(null);

    }
  };



  // ==========================================================
  // GET TENANT
  // ==========================================================

  const getTenant = (
    rental
  ) => {

    if (!rental?.tenant) {
      return null;
    }


    if (
      typeof rental.tenant ===
      'object'
    ) {

      return rental.tenant;

    }


    return null;
  };



  // ==========================================================
  // GET PROPERTY
  // ==========================================================

  const getProperty = (
    rental
  ) => {

    if (!rental?.property) {
      return null;
    }


    if (
      typeof rental.property ===
      'object'
    ) {

      return rental.property;

    }


    return null;
  };



  // ==========================================================
  // TENANT NAME
  // ==========================================================

  const getTenantName = (
    rental
  ) => {

    const tenant =
      getTenant(rental);


    return (
      tenant?.name ||
      rental?.tenantName ||
      'Unknown Tenant'
    );
  };



  // ==========================================================
  // PROPERTY NAME
  // ==========================================================

  const getPropertyName = (
    rental
  ) => {

    const property =
      getProperty(rental);


    return (
      property?.title ||
      rental?.propertyName ||
      'Unknown Property'
    );
  };



  // ==========================================================
  // RENT
  // ==========================================================

  const getRent = (
    rental
  ) => {

    const property =
      getProperty(rental);


    return (
      rental?.monthlyRent ??
      property?.monthlyRent ??
      0
    );
  };



  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return '—';
    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };



  // ==========================================================
  // FORMAT STATUS
  // ==========================================================

  const formatStatus = (
    status
  ) => {

    if (!status) {
      return 'Unknown';
    }


    if (status === 'active') {
      return 'Accepted';
    }


    if (status === 'pending') {
      return 'Pending';
    }


    if (status === 'cancelled') {
      return 'Rejected';
    }


    if (status === 'completed') {
      return 'Completed';
    }


    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };



  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredData =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return rentals.filter(
        (rental) => {

          const tenantName =
            getTenantName(
              rental
            ).toLowerCase();


          const propertyName =
            getPropertyName(
              rental
            ).toLowerCase();


          const matchesSearch =
            !search ||
            tenantName.includes(
              search
            ) ||
            propertyName.includes(
              search
            );


          const matchesStatus =
            statusFilter ===
              'all' ||
            rental.status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      rentals,
      searchTerm,
      statusFilter
    ]);



  // ==========================================================
  // VIEW TENANT
  // ==========================================================

  const handleView = (
    rental
  ) => {

    const tenant =
      getTenant(rental);


    if (tenant?._id) {

      navigate(
        `/landlord/tenants/${tenant._id}`
      );

      return;
    }

  };



  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const columns = [

    // --------------------------------------------------------
    // TENANT
    // --------------------------------------------------------

    {
      header: 'Tenant Name',

      accessor: 'tenant',

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

      }

    },


    // --------------------------------------------------------
    // PROPERTY
    // --------------------------------------------------------

    {
      header: 'Property',

      accessor: 'property',

      render: (row) => (

        <span className="text-ink">

          {getPropertyName(row)}

        </span>

      )

    },


    // --------------------------------------------------------
    // RENT
    // --------------------------------------------------------

    {
      header: 'Listed Rent',

      accessor: 'rent',

      render: (row) => (

        <span className="font-medium">

          ₹
          {Number(
            getRent(row)
          ).toLocaleString(
            'en-IN'
          )}

        </span>

      )

    },


    // --------------------------------------------------------
    // REQUEST DATE
    // --------------------------------------------------------

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

      )

    },


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    {
      header: 'Status',

      accessor: 'status',

      render: (row) => (

        <StatusBadge
          status={
            formatStatus(
              row.status
            )
          }
        />

      )

    },


    // --------------------------------------------------------
    // ACTIONS
    // --------------------------------------------------------

    {
      header: 'Actions',

      accessor: 'actions',

      render: (row) => {

        const isPending =
          row.status ===
          'pending';


        const isLoading =
          actionLoading ===
          row._id;


        return (

          <div className="flex items-center gap-2">


            {/* =================================================
                ACCEPT / REJECT
            ================================================= */}

            {isPending && (

              <>

                {/* ACCEPT */}

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      row,
                      'accepted'
                    )
                  }
                  disabled={isLoading}
                  className="p-1 text-text-muted hover:text-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Accept Request"
                >

                  {isLoading ? (

                    <Loader2
                      className="w-4 h-4 animate-spin"
                    />

                  ) : (

                    <CheckCircle
                      className="w-4 h-4"
                    />

                  )}

                </button>


                {/* REJECT */}

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      row,
                      'cancelled'
                    )
                  }
                  disabled={isLoading}
                  className="p-1 text-text-muted hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Reject Request"
                >

                  <Ban
                    className="w-4 h-4"
                  />

                </button>

              </>

            )}


            {/* =================================================
                VIEW TENANT
            ================================================= */}

            <button
              onClick={() =>
                handleView(row)
              }
              disabled={
                !getTenant(row)?._id
              }
              className="p-1 text-text-muted hover:text-lease-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="View Tenant Details"
            >

              <Eye
                className="w-4 h-4"
              />

            </button>


          </div>

        );

      }

    }

  ];



  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="space-y-6 fade-in pb-8">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-display font-bold text-ink">

            Rental Requests

          </h1>


          <p className="text-text-muted mt-1">

            Review and manage tenant rental requests for your properties.

          </p>

        </div>


        {/* REFRESH */}

        <button
          onClick={
            fetchRentals
          }
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors disabled:opacity-50"
        >

          <RefreshCw
            className={`w-4 h-4 ${
              loading
                ? 'animate-spin'
                : ''
            }`}
          />

          Refresh

        </button>

      </div>



      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {success && (

        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">

          {success}

        </div>

      )}



      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (

        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {error}

        </div>

      )}



      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">


        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">


          {/* SEARCH */}

          <div className="relative w-full sm:w-80">

            <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />


            <input
              type="text"
              placeholder="Search by tenant or property..."
              value={
                searchTerm
              }
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="w-full pl-9 pr-4 py-2 bg-paper border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 transition-all"
            />

          </div>



          {/* FILTER */}

          <div className="flex items-center gap-2 w-full sm:w-auto">

            <button
              onClick={() =>
                setShowFilters(
                  (prev) =>
                    !prev
                )
              }
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 bg-paper border border-border rounded-lg text-sm font-medium text-ink hover:bg-border/50 transition-colors"
            >

              <Filter
                className="w-4 h-4"
              />

              <span>
                Filters
              </span>

            </button>

          </div>

        </div>



        {/* ====================================================
            FILTER PANEL
        ==================================================== */}

        {showFilters && (

          <div className="p-4 border-b border-border bg-paper">

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">

              <label className="text-sm font-medium text-ink">

                Status

              </label>


              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-lease-500"
              >

                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Rejected
                </option>

              </select>


              <button
                onClick={() => {

                  setStatusFilter(
                    'all'
                  );

                  setSearchTerm('');

                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-text-muted hover:text-ink"
              >

                <X
                  className="w-4 h-4"
                />

                Clear

              </button>

            </div>

          </div>

        )}



        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (

          <div className="p-10 text-center text-text-muted">

            <div className="flex items-center justify-center gap-3">

              <Loader2
                className="w-5 h-5 animate-spin"
              />

              <span>
                Loading rental requests...
              </span>

            </div>

          </div>

        ) : (

          <DataTable
            columns={columns}
            data={filteredData}
          />

        )}



        {/* ====================================================
            EMPTY SEARCH RESULT
        ==================================================== */}

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



        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {!loading &&
          !error &&
          rentals.length === 0 && (

            <div className="p-10 text-center">

              <p className="font-medium text-ink">

                No rental requests yet

              </p>


              <p className="text-sm text-text-muted mt-1">

                Tenant rental requests for your properties will appear here.

              </p>

            </div>

          )}

      </div>

    </div>

  );

};


export default RentalRequests;  